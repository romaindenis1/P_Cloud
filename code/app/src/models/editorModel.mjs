const EditorModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "Editor",
    {
      editeur_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nom: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: "t_editeur",
      timestamps: false,
    }
  );
};

export { EditorModel };
