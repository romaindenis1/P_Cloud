const BookModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "Book",
    {
      livre_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: {
            args: [3, 50],
            msg: "Veuillez entrer un titre entre 3 et 50 caractères.",
          },
          notNull: {
            msg: "Ce champ ne peut pas être vide.",
          },
        },
      },
      nbPages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Ce champ ne peut pas être vide.",
          },
        },
      },
      extrait: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Ce champ ne peut pas être vide.",
          },
        },
      },
      resume: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Ce champ ne peut pas être vide.",
          },
        },
      },
      anneeEdition: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Ce champ ne peut pas être vide.",
          },
        },
      },
      _imageCouverture: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      datePublication: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      editeur_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "t_editeur",
          key: "editeur_id",
        },
      },
      categorie_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "t_categorie",
          key: "categorie_id",
        },
      },
      auteur_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "t_auteur",
          key: "auteur_id",
        },
      },
      user_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "t_utilisateur",
          key: "user_id",
        },
      },
    },
    {
      tableName: "t_livre",
      timestamps: false,
    }
  );
};

export { BookModel };
