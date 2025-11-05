import express from "express";
import { ValidationError, Op } from "sequelize";
import { success } from "../routes/helper.mjs";
import { Editor } from "../db/sequelize.mjs";

const editorRouter = express();

editorRouter.get("/", (req, res) => {
  if (req.query.nom) {
    return Editor.findAll({
      where: { nom: { [Op.like]: `%${req.query.nom}%` } },
    }).then((editors) => {
      const message = `Il y a ${editors.length} éditeurs qui correspondent au terme de la recherche`;
      res.json(success(message, editors));
    });
  }
  Editor.findAll({ order: ["editeur_id"] })
    .then((editors) => {
      const message = "Editeurs bien recuperées";
      res.json(success(message, editors));
    })
    .catch((error) => {
      const message =
        "Les éditeurs n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

export { editorRouter };
