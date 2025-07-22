import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  HasMany,
  Unique
} from "sequelize-typescript";

@Table({ tableName: "Invoices" })
class Invoices extends Model<Invoices> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  detail: string;

  @Column
  status: string;

  @Column
  value: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  dueDate: string;

  @Column
  companyId: number;

  // Novos campos para integração com Asaas
  @Column
  asaasPaymentId: string;

  @Column
  paymentLink: string;

  @Column
  invoiceUrl: string;

  @Column
  paymentDate: Date;

}

export default Invoices;
