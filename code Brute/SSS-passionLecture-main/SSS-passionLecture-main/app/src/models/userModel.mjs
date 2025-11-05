//definir la table user
const UserModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pseudo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: { msg: "Ce pseudo est déjà pris." },
        validate: {
          len: {
            args: [3, 25],
            msg: "Veuillez entrer un pseudo entre 2 et 25 caractères.",
          },
          notNull: {
            msg: "Ce champ ne peut pas être vide.",
          },
        },
      },
      password: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      dateEntree: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "t_utilisateur",
      timestamps: false,
    }
  );
};

export { UserModel };
