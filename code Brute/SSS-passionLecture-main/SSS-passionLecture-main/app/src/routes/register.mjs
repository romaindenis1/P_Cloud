import express from "express";
import jwt from "jsonwebtoken";
import { privKey } from "../auth/privKey.mjs";
import bcrypt from "bcrypt";
import { User } from "../db/sequelize.mjs";
import { ValidationError } from "sequelize";

const registerRouter = express();

registerRouter.post("/", (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    const message =
      "Le pseudo et le mot de passe sont obligatoires pour s'inscrire.";
    return res.status(400).json({ message });
  }

  bcrypt.hash(password, 10).then((hashedPassword) => {
    User.create({ pseudo, password: hashedPassword })
      .then((user) => {
        const message = "L'utilisateur a été créé.";
        res.json({ message, data: user });
      })
      .catch((error) => {
        if (error instanceof ValidationError) {
          return res.status(400).json({ message: error.message, data: error });
        }
        const message = "L'utilisateur n'a pas pu être créé. Réessayez.";
        res.status(500).json({ message, data: error });
      });
  });
});

export { registerRouter };
