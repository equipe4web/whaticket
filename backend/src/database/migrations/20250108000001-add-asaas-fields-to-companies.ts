import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Companies", "cpfCnpj", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "CPF ou CNPJ da empresa para integração com Asaas"
      }),
      queryInterface.addColumn("Companies", "address", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Endereço da empresa"
      }),
      queryInterface.addColumn("Companies", "addressNumber", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Número do endereço"
      }),
      queryInterface.addColumn("Companies", "complement", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Complemento do endereço"
      }),
      queryInterface.addColumn("Companies", "province", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bairro"
      }),
      queryInterface.addColumn("Companies", "city", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Cidade"
      }),
      queryInterface.addColumn("Companies", "state", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Estado"
      }),
      queryInterface.addColumn("Companies", "postalCode", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "CEP"
      }),
      queryInterface.addColumn("Companies", "asaasCustomerId", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID do cliente no Asaas"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Companies", "cpfCnpj"),
      queryInterface.removeColumn("Companies", "address"),
      queryInterface.removeColumn("Companies", "addressNumber"),
      queryInterface.removeColumn("Companies", "complement"),
      queryInterface.removeColumn("Companies", "province"),
      queryInterface.removeColumn("Companies", "city"),
      queryInterface.removeColumn("Companies", "state"),
      queryInterface.removeColumn("Companies", "postalCode"),
      queryInterface.removeColumn("Companies", "asaasCustomerId")
    ]);
  }
}; 