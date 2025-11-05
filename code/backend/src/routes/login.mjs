import express from "express";
import jwt from "jsonwebtoken";
import { privKey } from "../auth/privKey.mjs";
import bcrypt from "bcrypt";
import { User } from "../db/sequelize.mjs";

const loginRouter = express();

loginRouter.post("/", (req, res) => {
  const { pseudo, password } = req.body;
  if (!pseudo || !password) {
    const message =
      "Le pseudo et le mot de passe sont obligatoires pour se connecter.";
    return res.status(400).json({ message });
  }

  User.findOne({ where: { pseudo } })
    .then((user) => {
      if (!user) {
        const message = "Le pseudo est incorrect.";
        return res.status(401).json({ message });
      }

      bcrypt
        .compare(password, user.password)
        .then((validPassword) => {
          if (!validPassword) {
            const message = "Le mot de passe est faux.";
            return res.status(401).json({ message });
          } else {
            const token = jwt.sign({ user_Id: user.user_id }, privKey, {
              expiresIn: "1y",
            });
            res.cookie("passionLecture", token, {
              httpOnly: true,
              secure: false, // Set to true if using HTTPS
              sameSite: "Strict",
              maxAge: 1000 * 60 * 60 * 24, // 1 year
            });
            const message = "L'utilisateur a été connecté.";
            res.json({ message, data: user });
          }
        })
        .catch((error) => {
          const message = "Erreur lors de la vérification du mot de passe.";
          res.status(500).json({ message, data: error });
        });
    })
    .catch((error) => {
      const message = "L'utilisateur n'a pas pu être connecté. Réessayez.";
      res.status(500).json({ message, data: error });
    });
});

export { loginRouter };
