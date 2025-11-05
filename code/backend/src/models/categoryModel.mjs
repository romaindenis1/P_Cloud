const CategoryModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "Category",
    {
      categorie_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nom: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: {
            args: [3, 50],
            msg: "Veuillez entrer un nom entre 3 et 50 caractères.",
          },
          notNull: {
            msg: "Ce champ ne peut pas être vide.",
          },
        },
      },
    },
    {
      tableName: "t_categorie",
      timestamps: false,
    }
  );
};

export { CategoryModel };
