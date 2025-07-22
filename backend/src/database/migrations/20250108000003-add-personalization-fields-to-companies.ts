import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      // Logotipos personalizados
      queryInterface.addColumn("Companies", "logoLight", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Logotipo modo claro da empresa"
      }),
      queryInterface.addColumn("Companies", "logoDark", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Logotipo modo escuro da empresa"
      }),
      queryInterface.addColumn("Companies", "logoFavicon", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Favicon da empresa"
      }),
      queryInterface.addColumn("Companies", "logoLogin", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Logotipo para tela de login"
      }),
      
      // Cores personalizadas
      queryInterface.addColumn("Companies", "primaryColorLight", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#2DDD7F",
        comment: "Cor primária modo claro"
      }),
      queryInterface.addColumn("Companies", "primaryColorDark", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#FFFFFF",
        comment: "Cor primária modo escuro"
      }),
      queryInterface.addColumn("Companies", "secondaryColorLight", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#F3F3F3",
        comment: "Cor secundária modo claro"
      }),
      queryInterface.addColumn("Companies", "secondaryColorDark", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#333333",
        comment: "Cor secundária modo escuro"
      }),
      
      // Configurações adicionais
      queryInterface.addColumn("Companies", "customCss", {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "CSS customizado da empresa"
      }),
      queryInterface.addColumn("Companies", "brandName", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Nome da marca/sistema personalizado"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Companies", "logoLight"),
      queryInterface.removeColumn("Companies", "logoDark"),
      queryInterface.removeColumn("Companies", "logoFavicon"),
      queryInterface.removeColumn("Companies", "logoLogin"),
      queryInterface.removeColumn("Companies", "primaryColorLight"),
      queryInterface.removeColumn("Companies", "primaryColorDark"),
      queryInterface.removeColumn("Companies", "secondaryColorLight"),
      queryInterface.removeColumn("Companies", "secondaryColorDark"),
      queryInterface.removeColumn("Companies", "customCss"),
      queryInterface.removeColumn("Companies", "brandName")
    ]);
  }
}; 