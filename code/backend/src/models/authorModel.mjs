const AuthorModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "Author",
    {
      auteur_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nom: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      prenom: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: "t_auteur",
      timestamps: false,
    }
  );
};

export { AuthorModel };
