import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
import { BookModel } from "../models/bookModel.mjs";
import { UserModel } from "../models/userModel.mjs";
import { AuthorModel } from "../models/authorModel.mjs";
import { EditorModel } from "../models/editorModel.mjs";
import { CategoryModel } from "../models/categoryModel.mjs";
import { CommenterModel } from "../models/commenterModel.mjs";
import { NoteModel } from "../models/donnerModel.mjs";
import bcrypt from "bcrypt";

// Prefer remote Azure DB, but fall back to local config if it fails.
// Credentials can be supplied via environment variables: DB_NAME, DB_USER, DB_PASSWORD
const DEFAULT_DB_NAME = process.env.DB_NAME || "passionlecture";
const DEFAULT_DB_USER = process.env.DB_USER || "root";
const DEFAULT_DB_PASSWORD = process.env.DB_PASSWORD || "root";

const LOCAL_HOST = process.env.DB_LOCAL_HOST || "localhost";
const LOCAL_PORT = parseInt(process.env.DB_LOCAL_PORT || "6034", 10);

// Function to detect common Azure/MySQL connection environment variables and parse them
function parseMysqlConnStr(connStr) {
  // Azure's MYSQLCONNSTR_<name> format is semicolon-separated key=value pairs
  const parts = connStr.split(";").map((p) => p.trim()).filter(Boolean);
  const obj = {};
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (!k) continue;
    obj[k.trim().toLowerCase()] = rest.join("=").trim();
  }
  // keys we expect: database, data source, user id, password
  return {
    database: obj.database || obj.db || undefined,
    host: obj["data source"] || obj.server || undefined,
    user: (obj["user id"] || obj.user || obj.uid) || undefined,
    password: obj.password || obj.pwd || undefined,
  };
}

function parseDatabaseUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return {
      database: u.pathname ? u.pathname.replace(/^\//, "") : undefined,
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : undefined,
      user: u.username || undefined,
      password: u.password || undefined,
    };
  } catch (e) {
    return null;
  }
}

// detect Azure-provided MySQL connection strings (App Service exposes MYSQLCONNSTR_<name>)
let azureConn = null;
for (const k of Object.keys(process.env)) {
  if (k.startsWith("MYSQLCONNSTR_")) {
    azureConn = parseMysqlConnStr(process.env[k]);
    break;
  }
}

// also accept DATABASE_URL (mysql://user:pass@host:port/dbname)
if (!azureConn && process.env.DATABASE_URL) {
  azureConn = parseDatabaseUrl(process.env.DATABASE_URL);
}

// also accept custom Azure var names
if (!azureConn && process.env.AZURE_MYSQL_CONN_STR) {
  azureConn = parseMysqlConnStr(process.env.AZURE_MYSQL_CONN_STR);
}

// Finally fallback to explicit DB_REMOTE_* vars if present
if (!azureConn && process.env.DB_REMOTE_HOST) {
  azureConn = {
    host: process.env.DB_REMOTE_HOST,
    port: process.env.DB_REMOTE_PORT ? parseInt(process.env.DB_REMOTE_PORT, 10) : undefined,
    database: process.env.DB_NAME || DEFAULT_DB_NAME,
    user: process.env.DB_USER || DEFAULT_DB_USER,
    password: process.env.DB_PASSWORD || DEFAULT_DB_PASSWORD,
  };
}

let sequelize;

// Try remote (Azure) first if we detected a remote connection definition
if (azureConn && azureConn.host) {
  const remoteHost = azureConn.host;
  const remotePort = azureConn.port || 3306;
  const dbName = azureConn.database || DEFAULT_DB_NAME;
  const dbUser = azureConn.user || DEFAULT_DB_USER;
  const dbPassword = azureConn.password || DEFAULT_DB_PASSWORD;

  try {
    const remote = new Sequelize(dbName, dbUser, dbPassword, {
      host: remoteHost,
      dialect: "mysql",
      port: remotePort,
      logging: false,
      dialectOptions: {
        // Azure MySQL may require SSL; in many dev environments we allow self-signed.
        ssl: { rejectUnauthorized: false },
      },
    });
    await remote.authenticate();
    console.log(`Connected to remote DB ${remoteHost}:${remotePort}`);
    sequelize = remote;
  } catch (err) {
    console.warn(
      `Remote DB connection to ${remoteHost}:${remotePort} failed, falling back to local DB.`,
      err.message || err
    );
  }
}

// If remote didn't connect, fall back to local
if (!sequelize) {
  sequelize = new Sequelize(DEFAULT_DB_NAME, DEFAULT_DB_USER, DEFAULT_DB_PASSWORD, {
    host: LOCAL_HOST,
    dialect: "mysql",
    port: LOCAL_PORT,
    logging: false,
  });
  try {
    await sequelize.authenticate();
    console.log(`Connected to local DB ${LOCAL_HOST}:${LOCAL_PORT}`);
  } catch (localErr) {
    console.error("Local DB connection failed:", localErr.message || localErr);
    // rethrow so callers know initialization failed
    throw localErr;
  }
}

import { books } from "./mock-book.mjs";
import { users } from "./mock-user.mjs";
import { authors } from "./mock-author.mjs";
import { editors } from "./mock-editor.mjs";
import { categorys } from "./mock-category.mjs";
import { comments } from "./mock-comment.mjs";
import { notes } from "./mock-note.mjs";

const Book = BookModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Author = AuthorModel(sequelize, DataTypes);
const Editor = EditorModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);
const Comment = CommenterModel(sequelize, DataTypes);
const Note = NoteModel(sequelize, DataTypes);

const initDb = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log(" La base de données db_book a bien été synchronisée");

    await importEditors();
    await importAuthors();
    await importUsers(); // Les utilisateurs doivent être créés avant d’être référencés
    await importCategorys();
    await importBooks(); // Les livres doivent être créés avant d’être référencés
    await importComments(); // Les commentaires doivent être créés en dernier
    await importNotes();

    console.log("Importation des données terminée !");
  } catch (error) {
    console.error(" Erreur lors de l'initialisation de la base :", error);
  }
};

const importBooks = async () => {
  await Promise.all(
    books.map(async (book) => {
      const createdBook = await Book.create({
        titre: book.titre,
        nbPages: book.nbPages,
        extrait: book.extrait,
        resume: book.resume,
        anneeEdition: book.anneeEdition,
        _imageCouverture: book._imageCouverture,
        editeur_fk: book.editeur_fk,
        categorie_fk: book.categorie_fk,
        auteur_fk: book.auteur_fk,
        user_fk: book.user_fk,
      });
      console.log(createdBook.toJSON());
    })
  );
};

const importAuthors = async () => {
  await Promise.all(
    authors.map(async (author) => {
      const createdAuthor = await Author.create({
        nom: author.nom,
        prenom: author.prenom,
      });
      console.log(createdAuthor.toJSON());
    })
  );
};

const importComments = async () => {
  await Promise.all(
    comments.map(async (comment) => {
      await Comment.create({
        livre_fk: comment.livre_fk,
        user_fk: comment.user_fk,
        contenu: comment.contenu,
      });
    })
  );
};

const importEditors = async () => {
  await Promise.all(
    editors.map(async (editor) => {
      const createdEditor = await Editor.create({
        nom: editor.nom,
      });
      console.log(createdEditor.toJSON());
    })
  );
};

const importCategorys = async () => {
  await Promise.all(
    categorys.map(async (category) => {
      const createdCategory = await Category.create({
        nom: category.nom,
      });
      console.log(createdCategory.toJSON());
    })
  );
};

const importNotes = async () => {
  await Promise.all(
    notes.map(async (note) => {
      const createdNote = await Note.create({
        livre_fk: note.livre_fk,
        user_fk: note.user_fk,
        note: note.note,
      });
    })
  );
};

const importUsers = async () => {
  await Promise.all(
    users.map(async (user) => {
      const hashpassword = await bcrypt.hash(user.password, 10);
      const createdUser = await User.create({
        pseudo: user.pseudo,
        password: hashpassword,
        dateEntree: user.dateEntree,
        isAdmin: user.isAdmin,
      });
      console.log(createdUser.toJSON());
    })
  );
};

export {
  sequelize,
  initDb,
  Book,
  User,
  Author,
  Editor,
  Category,
  Comment,
  Note,
};
