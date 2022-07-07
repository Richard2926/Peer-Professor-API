import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Helper } from "./Helper";

@Entity("HelperBankTransfer")
export class HelperBankTransfer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => Helper, (helper) => helper.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "helper_id" })
  helper: Helper;

  @Column({
    type: "decimal",
    nullable: false,
    scale: 2,
    precision: 10, // max digits for numeric + decimal part
  })
  amount: number;

  @Column({
    type: "boolean",
    nullable: false,
  })
  pending: boolean;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
