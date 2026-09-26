import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { PaymentStatus } from "../constants/payment.constants";

@Entity("payments")
export class Payment {
  @PrimaryColumn({ type: "varchar", length: 255 })
  id!: string; // transaction_id

  @Column({ type: "enum", enum: PaymentStatus })
  status!: PaymentStatus;

  @Column({ type: "numeric" })
  amount!: number;

  @Column({ type: "varchar", length: 10 })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}