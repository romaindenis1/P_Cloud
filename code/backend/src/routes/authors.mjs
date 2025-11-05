import express from "express";
import { success } from "../routes/helper.mjs";
import { Book, Author } from "../db/sequelize.mjs";
import { ValidationError, Op } from "sequelize";

const authorRouter = express();

authorRouter.get("/", (req, res) => {
  const { prenom, nom } = req.query;

  let whereCondition = {};
  if (prenom || nom) {
    whereCondition = {
      [Op.and]: [],
    };

    if (prenom) {
      whereCondition[Op.and].push({ prenom: { [Op.like]: `%${prenom}%` } });
    }
    if (nom) {
      whereCondition[Op.and].push({ nom: { [Op.like]: `%${nom}%` } });
    }
    return Author.findAll({ where: whereCondition })
      .then((authors) => {
        const message = `Il y a ${authors.length} auteurs qui correspondent au terme de la recherche`;
        res.json(success(message, authors));
      })
      .catch((error) => {
        const message = "Erreur lors de la recherche des auteurs.";
        res.status(500).json({ message, data: error });
      });
  }

  // Default: get all authors
  Author.findAll({ order: ["prenom"] })
    .then((authors) => {
      const message = "Les auteurs ont bien été récupérés";
      res.json(success(message, authors));
    })
    .catch((error) => {
      const message =
        "Les auteurs n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

authorRouter.get("/:id", (req, res) => {
  Author.findByPk(req.params.id)
    .then((author) => {
      if (author === null) {
        const message =
          "L'auteur demandé n'existe pas. Merci de réessayer avec un autre identifiant.";
        return res.status(404).json({ message });
      }
      const message = `L'auteur dont l'id vaut ${author.auteur_id} a bien été récupéré !`;
      res.json(success(message, author));
    })
    .catch((error) => {
      const message =
        "L'auteur n'a pas pu être récupéré. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

authorRouter.get("/:id/books", (req, res) => {
  Book.findAll({ where: { auteur_fk: req.params.id } })
    .then((books) => {
      const message = `Les livres publiés ont bien été récupérés. ${books.length}`;
      return res.json(success(message, books));
    })
    .catch((error) => {
      const message = `Les livres n'ont pas pu être récupérés. Veuillez reéssayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

export { authorRouter };
