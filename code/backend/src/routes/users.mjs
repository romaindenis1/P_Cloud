import express from "express";
import auth from "../auth/auth.mjs";
import jwt from "jsonwebtoken";
import { success } from "../routes/helper.mjs";
import { Book, User } from "../db/sequelize.mjs";

const userRouter = express();

userRouter.get("/", (req, res) => {
  User.findAll({ order: ["pseudo"] })
    .then((users) => {
      const message = `Il y a ${users.length} utilisateurs qui correspondent au terme de la recherche`;
      res.json(success(message, users));
    })
    .catch((error) => {
      const message = `Les utilisateurs n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

//récuprée l'id de l'utilisateur connecté
userRouter.get("/currentUser", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user_Id, {
      attributes: { exclude: ["password"] }, // évite d'envoyer le mot de passe
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json(user);
  } catch (error) {
    const message = `L'id utilisateur n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
    res.status(500).json({ message, data: error });
  }
});

userRouter.get("/:id", auth, (req, res) => {
  User.findByPk(req.params.id)
    .then((user) => {
      if (user === null) {
        const message = `L'utilisateur demandé n'existe pas. Merci de réessayer avec un autre identifiant.`;
        return res.status(404).json({ message });
      }
      const message = `L'utilisateur dont l'id vaut ${user.user_id} a bien été récupéré !`;
      res.json(success(message, user));
    })
    .catch((error) => {
      const message = `L'utilisateur n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

userRouter.post("/logout", (req, res) => {
  try {
    // Supprime le cookie "token"
    res.clearCookie("passionLecture", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      path: "/",
    });

    const message = `L'utilisateur a bien été déconnecté.`;
    res.status(200).json({ message });
  } catch (error) {
    const message = `La déconnexion a échoué. Veuillez réessayer dans quelques instants.`;
    res.status(500).json({ message, data: error });
  }
});

userRouter.get("/:id/books", auth, (req, res) => {
  Book.findAll({ where: { user_fk: req.params.id } })
    .then((books) => {
      const message = `Les livres publiés ont bien été récupérés. ${books.length}`;
      return res.json(success(message, books));
    })
    .catch((error) => {
      const message = `Les livres n'ont pas pu être récupérés. Veuillez reéssayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

export { userRouter };
