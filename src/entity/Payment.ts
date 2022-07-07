import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Student } from "./Student";
import { Helper } from "./Helper";
import { Milestone } from "./Milestone";

@Entity("Payment")
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => Student, (student) => student.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  student: Student;

  @Column({ nullable: false })
  student_id: string;

  @ManyToOne((_) => Helper, (helper) => helper.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "helper_id" })
  helper: Helper;

  @Column({ nullable: false })
  helper_id: string;

  @OneToOne((_) => Milestone, (milestone) => milestone.id, { nullable: false })
  @JoinColumn({ name: "milestone_id" })
  milestone: Milestone;

  @Column({ nullable: false })
  milestone_id: number;

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
