import express from "express";
import auth from "../auth/auth.mjs";
import { success } from "../routes/helper.mjs";
import { Book, Category, Comment, Note } from "../db/sequelize.mjs";
import { ValidationError, Op } from "sequelize";
import { upload } from "../middleware/multer.mjs";
import multer from "multer";
const booksRouter = express();

/**
 * @swagger
 * /api/books/:
 *  get:
 *    tags: [Books]
 *    security:
 *      - bearerAuth: []
 *    summary: Récupérer les livres
 *    description: Récupérer tout les livres
 *    responses:
 *      200:
 *        description: tout les livres.
 *        content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              data:
 *                type: object
 *                properties:
 *                  livre_id:
 *                    type: integer
 *                    description: L'identifiant du livre.
 *                    example: 4
 *                  titre:
 *                    type: string
 *                    description: Le titre du livre.
 *                    example: 1984
 *                  nbPages:
 *                    type: integer
 *                    description: Le nombre de pages du livre.
 *                    example: 328
 *                  extrait:
 *                    type: string
 *                    description: Un extrait du livre.
 *                    example: "Big Brother vous regarde."
 *                  resume:
 *                    type: string
 *                    description: Un résumé du livre.
 *                    example: "Dans une société totalitaire, un homme tente de se rebeller contre le contrôle du gouvernement."
 *                  anneeEdition:
 *                    type: string
 *                    format: date
 *                    description: L'année d'édition du livre.
 *                    example: "1949-06-08T00:00:00.000Z"
 *                  imageCouverture:
 *                    type: string
 *                    format: binary
 *                    nullable: true
 *                    description: L'image de couverture du livre.
 *                    example: null
 *                  datePublication:
 *                    type: string
 *                    format: date-time
 *                    description: La date et l'heure de la publication du livre.
 *                    example: "2025-03-11T13:40:34.000Z"
 *                  editeur_fk:
 *                    type: integer
 *                    description: L'identifiant de l'éditeur du livre.
 *                    example: 2
 *                  categorie_fk:
 *                    type: integer
 *                    description: L'identifiant de la catégorie du livre.
 *                    example: 2
 *                  auteur_fk:
 *                    type: integer
 *                    description: L'identifiant de l'auteur du livre.
 *                    example: 2
 *                  user_fk:
 *                    type: integer
 *                    description: L'identifiant de l'utilisateur ayant ajouté le livre.
 *                    example: 1
 *
 */
booksRouter.get("/", (req, res) => {
  if (req.query.titre) {
    return Book.findAll({
      where: { titre: { [Op.like]: `%${req.query.titre}%` } },
    }).then((books) => {
      const message = `Il y a ${books.length} livres qui correspondent au terme de la recherche`;
      res.json(success(message, books));
    });
  }
  const order =
    req.query.sortByDateAsc == "true"
      ? [["datePublication", "DESC"]]
      : [["titre"]];

  //if limit == null or 0 => pas de limite-
  let limit;
  if (req.query.limit && req.query.limit != 0) {
    limit = parseInt(req.query.limit);
  }
  Book.findAll({ order: order, limit: limit ? limit : null })
    .then((books) => {
      const message = "Les livres ont bien été récupéré";
      // res.header("Access-Control-Allow-Origin", "*");
      res.json(success(message, books));
    })
    .catch((error) => {
      const message =
        "Les livres n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

//voir les détails d'un livre
booksRouter.get("/:id", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      if (book === null) {
        const message =
          "Le livre demandé n'existe pas. Merci de réessayer avec un autre identifiant.";
        return res.status(404).json({ message });
      }
      const message = `Le livre dont l'id vaut ${book.livre_id} a bien été récupéré.`;
      res.json(success(message, book));
    })
    .catch((error) => {
      const message =
        "Le livre n'a pas pu être récupéré. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

//créer un livre
booksRouter.post("/", auth, upload.single("_imageCouverture"), (req, res) => {
  const imageCouverturePath = req.file ? `uploads/${req.file.filename}` : null;
  Book.create({
    titre: req.body.titre,
    nbPages: req.body.nbPages,
    extrait: req.body.extrait,
    resume: req.body.resume,
    anneeEdition: req.body.anneeEdition,
    _imageCouverture: imageCouverturePath,
    editeur_fk: req.body.editeur_fk,
    categorie_fk: req.body.categorie_fk,
    auteur_fk: req.body.auteur_fk,
    user_fk: req.user_Id,
  })
    .then((createdBook) => {
      const message = `Le livre ${createdBook.titre} a bien été créé !`;
      res.json(success(message, createdBook));
    })
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message, data: error });
      }
      const message =
        "Le livre n'a pas pu être créer. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

//ajouter un commentaire
booksRouter.post("/:id/comments", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      if (book === null) {
        const message = "";
        return res.status(404).json({ message });
      }
      return Comment.create({
        livre_fk: book.livre_id,
        user_fk: req.body.user_fk,
        contenu: req.body.contenu,
      }).then((createdComment) => {
        const message = ` ${createdComment.id} `;
        res.json(success(message, createdComment));
      });
    })
    .catch((error) => {
      const message =
        "Le commentaire n'a pas pu être ajouté. Veuillez réessayer plus tard.";
      res.status(500).json({ message, data: error });
    });
});

//ajouter une note
booksRouter.post("/:id/notes", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      if (book === null) {
        const message = "";
        return res.status(404).json({ message });
      }
      return Note.create({
        livre_fk: book.livre_id,
        user_fk: req.body.user_fk,
        note: req.body.note,
      }).then((createdNote) => {
        const message = ` ${createdNote.id} `;
        res.json(success(message, createdNote));
      });
    })
    .catch((error) => {
      const message =
        "La note n'a pas pu être ajoutée. Veuillez réessayer plus tard.";
      res.status(500).json({ message, data: error });
    });
});

//recuperer les commentaire d'un livre
booksRouter.get("/:id/comments", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      Comment.findAll({ where: { livre_fk: book.livre_id } }).then(
        (commentaire) => {
          const message = `Les commentaires du livre dont l'id vaut ${book.livre_id} ont bien été récupéré.`;
          res.json(success(message, commentaire));
        }
      );
    })
    .catch((error) => {
      const message =
        "Le livre n'a pas pu être récupéré. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

//recuperer les notes d'un livre
booksRouter.get("/:id/notes", (req, res) => {
  Book.findByPk(req.params.id)
    .then((book) => {
      Note.findAll({ where: { livre_fk: book.livre_id } }).then((note) => {
        const message = `Les notes du livre dont l'id vaut ${book.livre_id} ont bien été récupéré.`;
        res.json(success(message, note));
      });
    })
    .catch((error) => {
      const message =
        "Le livre n'a pas pu être récupéré. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

booksRouter.put("/:id", upload.single("_imageCouverture"), async (req, res) => {
  const bookId = req.params.id;

  const {
    titre,
    nbPages,
    extrait,
    resume,
    anneeEdition,
    editeur_fk,
    categorie_fk,
    auteur_fk,
    user_fk,
  } = req.body;

  const imagePath = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const updatedData = {
      titre,
      nbPages,
      extrait,
      resume,
      anneeEdition,
      editeur_fk,
      categorie_fk,
      auteur_fk,
      user_fk,
    };

    if (imagePath) {
      updatedData._imageCouverture = imagePath;
    }

    await Book.update(updatedData, { where: { livre_id: bookId } });

    const updatedBook = await Book.findByPk(bookId);

    if (!updatedBook) {
      return res.status(404).json({
        message:
          "Le livre demandé n'existe pas. Merci de réessayer avec un autre identifiant.",
      });
    }

    const message = `Le livre ${updatedBook.titre} dont l'id vaut ${updatedBook.livre_id} a été mis à jour avec succès`;
    res.json({ message, data: updatedBook });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({
      message:
        "Le livre n'a pas pu être mis à jour. Merci de réessayer dans quelques instants.",
      data: error,
    });
  }
});

//delete un livre
booksRouter.delete("/:id", (req, res) => {
  Book.findByPk(req.params.id)
    .then((deletedBook) => {
      if (deletedBook === null) {
        const message =
          "Le livre demandé n'existe pas. Merci de réessayer avec un autre identifiant.";
        return res.status(404).json({ message });
      }
      return Comment.destroy({
        where: { livre_fk: req.params.id },
      }).then((deletedBook) => {
        Note.destroy({
          where: { livre_fk: req.params.id },
        }),
          Book.destroy({
            where: { livre_id: req.params.id },
          });
        const message = `Le livre ${req.params.id} a bien été supprimé !`;
        res.json(success(message, deletedBook));
      });
    })
    .catch((error) => {
      const message =
        "Le livre n'a pas pu être supprimé. Merci de réessayer dans quelques instants.";
      res.status(500).json({ message, data: error });
    });
});

export { booksRouter };
