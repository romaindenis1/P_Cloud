import swaggerJSDoc from "swagger-jsdoc";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "295-passion-lecture",
      version: "1.0.0",
      description: "API REST permettant de gérer des livres",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Book: {
          type: "object",
          required: [
            "titre",
            "nbPages",
            "extrait",
            "resume",
            "anneeEdition",
            "editeur_fk",
            "categorie_fk",
            "auteur_fk",
            "user_fk",
          ],
          properties: {
            livre_id: {
              type: "integer",
              description: "L'identifiant du livre.",
            },
            titre: {
              type: "string",
              maxLength: 50,
              description: "Le titre du livre.",
            },
            nbPages: {
              type: "integer",
              description: "Le nombre de pages du livre.",
            },
            extrait: {
              type: "string",
              maxLength: 150,
              description: "Un extrait unique du livre.",
            },
            resume: {
              type: "string",
              description: "Un résumé détaillé du livre.",
            },
            anneeEdition: {
              type: "string",
              format: "date",
              description: "L'année d'édition du livre.",
            },
            imageCouverture: {
              type: "string",
              format: "binary",
              description: "L'image de couverture du livre (BLOB).",
            },
            datePublication: {
              type: "string",
              format: "date-time",
              description: "La date et l'heure de la publication du livre.",
            },
            editeur_fk: {
              type: "integer",
              description: "L'identifiant de l'éditeur du livre.",
            },
            categorie_fk: {
              type: "integer",
              description: "L'identifiant de la catégorie du livre.",
            },
            auteur_fk: {
              type: "integer",
              description: "L'identifiant de l'auteur du livre.",
            },
            user_fk: {
              type: "integer",
              description:
                "L'identifiant de l'utilisateur ayant ajouté le livre.",
            },
          },
        },
        // Ajoutez d'autres schémas ici si nécessaire
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.mjs"], // Chemins vers vos fichiers de route
};
const swaggerSpec = swaggerJSDoc(options);
export { swaggerSpec };
