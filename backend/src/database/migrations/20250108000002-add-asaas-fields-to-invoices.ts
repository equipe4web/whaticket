import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Invoices", "asaasPaymentId", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID do pagamento no Asaas"
      }),
      queryInterface.addColumn("Invoices", "paymentLink", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Link de pagamento do Asaas"
      }),
      queryInterface.addColumn("Invoices", "invoiceUrl", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "URL da fatura no Asaas"
      }),
      queryInterface.addColumn("Invoices", "paymentDate", {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Data do pagamento"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Invoices", "asaasPaymentId"),
      queryInterface.removeColumn("Invoices", "paymentLink"),
      queryInterface.removeColumn("Invoices", "invoiceUrl"),
      queryInterface.removeColumn("Invoices", "paymentDate")
    ]);
  }
}; 