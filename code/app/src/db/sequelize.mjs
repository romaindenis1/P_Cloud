import { Sequelize, DataTypes } from "sequelize";
import { BookModel } from "../models/bookModel.mjs";
import { UserModel } from "../models/userModel.mjs";
import { AuthorModel } from "../models/authorModel.mjs";
import { EditorModel } from "../models/editorModel.mjs";
import { CategoryModel } from "../models/categoryModel.mjs";
import { CommenterModel } from "../models/commenterModel.mjs";
import { NoteModel } from "../models/donnerModel.mjs";
import bcrypt from "bcrypt";

const sequelize = new Sequelize(
  "db_passionlecture", // Nom de la DB qui doit exister
  "root", // Nom de l'utilisateur
  "root", // Mot de passe de l'utilisateur
  {
    host: "localhost",
    dialect: "mysql",
    port: 6034,
    logging: false,
  }
);

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
