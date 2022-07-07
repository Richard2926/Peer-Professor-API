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
import { Assignment } from "./Assignment";

@Entity("Milestone")
export class Milestone extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  assignment_id: number;

  @ManyToOne((_) => Assignment, (assignment) => assignment.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "assignment_id" })
  assignment: Assignment;

  @Column({
    type: "decimal",
    nullable: false,
    scale: 2,
    precision: 10, // max digits for numeric + decimal part
  })
  price: number;

  @Column({
    type: "text",
    nullable: false,
  })
  title: string;

  @Column({
    type: "text",
    nullable: false,
  })
  description: string;

  @Column({
    type: "datetime",
    nullable: false,
  })
  deadline: Date;

  @Column({
    type: "boolean",
    nullable: false,
  })
  completed: boolean;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
