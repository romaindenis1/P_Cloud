import express from "express";
import { ValidationError, Op } from "sequelize";
import { success } from "../routes/helper.mjs";
import { Category, Book } from "../db/sequelize.mjs";

const categorieRouter = express();

categorieRouter.get("/", (req, res) => {
  if (req.query.nom) {
    return Category.findAll({
      where: { nom: { [Op.like]: `%${req.query.nom}%` } },
    }).then((categories) => {
      const message = `Il y a ${categories.length} categories qui correspondent au terme de la recherche`;
      res.json(success(message, categories));
    });
  }
  Category.findAll({ order: ["categorie_id"] })
    .then((categorys) => {
      const message = "Categories bien recuperées";
      // res.header("Access-Control-Allow-Origin", "*");
      res.json(success(message, categorys));
    })
    .catch((error) => {
      const message =
        "Les categorie n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

categorieRouter.get("/:id", (req, res) => {
  Category.findByPk(req.params.id)
    .then((category) => {
      if (category === null) {
        const message = `La catégorie demandée n'existe pas. merci de réessayer avec un autre identifiant.`;
        return res.status(404).json({ message });
      }
      const message = `La catégorie dont l'id vaut ${category.categorie_id} a bien été récupéré.`;
      return res.json(success(message, category));
    })
    .catch((error) => {
      const message = `La catégorie n'a pas pu être récupérée. Merci de réessayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

categorieRouter.get("/:id/books", (req, res) => {
  Book.findAll({ where: { categorie_fk: req.params.id } })
    .then((books) => {
      const message = `Les livres publiés ont bien été récupérés. ${books.length}`;
      return res.json(success(message, books));
    })
    .catch((error) => {
      const message = `Les livres n'ont pas pu être récupérés. Veuillez reéssayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

export { categorieRouter };
