import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.mjs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { sequelize, initDb, Book, Category } from "../src/db/sequelize.mjs";
import { success } from "./routes/helper.mjs";
import cors from "cors";
import { privKey } from "./auth/privKey.mjs";
import dotenv from "dotenv";
import session from "express-session";
import msalRouter from "./auth/msal.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = import.meta.dirname;
const __filename = fileURLToPath(import.meta.url);

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
const app = express();
const port =  process.env.PORT || 3000;

//le middleware express.json() pour analyser le corps des requêtes JSON.
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); //indique le dossier ou sont les vues

app.use(cookieParser());

dotenv.config();

// session middleware required for MSAL flows
app.use(
session({
  secret: process.env.SESSION_SECRET || "change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});
);

// Mount MSAL routes only if enabled in env
if (process.env.AZURE_AUTH_ENABLED === "true" || process.env.AZURE_AUTH_ENABLED === "1") {
  app.use("/auth/msal", msalRouter);
}

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.get("/", (req, res) => {
  Book.findAll({ order: ["datePublication"], limit: 5 })
    .then((books) => {
      const message = "Les livres ont bien été récupéré";
      res.json(success(message, books));
    })
    .catch((error) => {
      console.error("Error fetching books:", error);
      const message =
        "Les livres n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});
app.use(express.static(__dirname + "/public"));

app.get("/api/auth/check", (req, res) => {
  const token = req.cookies.passionLecture;

  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, privKey); // replace with your real secret
    res.status(200).json({ user });
  } catch (err) {
    res.sendStatus(401); // Invalid token
  }
});

import { loginRouter } from "./routes/login.mjs";
app.use("/api/login", loginRouter);

import { registerRouter } from "./routes/register.mjs";
app.use("/api/register", registerRouter);

import { categorieRouter } from "./routes/categorie.mjs";
app.use("/api/categories", categorieRouter);

import { booksRouter } from "./routes/books.mjs";
app.use("/api/books", booksRouter);

import { userRouter } from "./routes/users.mjs";
app.use("/api/users", userRouter);

import { authorRouter } from "./routes/authors.mjs";
app.use("/api/authors", authorRouter);

import { editorRouter } from "./routes/editors.mjs";
app.use("/api/editors", editorRouter);

const UPLOADS_DIR = __dirname + "/uploads";
app.use("/uploads", express.static(UPLOADS_DIR));

// Si aucune route ne correspondant à l'URL demandée par le consommateur
// On place le code a la fin, car la requette passera d'abord par les autres route, et si aucune ne correspond la route n'est pas trouvé donc 404
app.use(({ res }) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json(message);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});

sequelize
  .authenticate()
  .then((_) => console.log("Connexion à la base de données réussie."))
  .catch((error) => console.error("Erreur de connexion à la base de données"));

initDb();
