const CommenterModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "Commenter",
    {
      livre_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "t_livre",
          key: "livre_id",
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
      contenu: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "t_commenter",
    }
  );
};

export { CommenterModel };
