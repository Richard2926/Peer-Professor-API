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
import { Student } from "./Student";
import { Assignment } from "./Assignment";
import { Milestone } from "./Milestone";

@Entity("Message")
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
    nullable: false,
  })
  text: string;

  @Column({ nullable: false })
  sender_id: string;

  @ManyToOne((_) => Student, (student) => student.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "sender_id" })
  sender: Student;

  @Column({ nullable: false })
  recipient_id: string;
  @ManyToOne((_) => Student, (student) => student.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "recipient_id" })
  recipient: Student;

  @Column({ nullable: false })
  assignment_id: string;
  @ManyToOne((_) => Assignment, (assignment) => assignment.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "assignment_id" })
  assignment: Assignment;

  @Column({ nullable: true })
  wait_for_completion: number;
  @ManyToOne((_) => Milestone, (milestone) => milestone.id, {
    nullable: true,
  })
  @JoinColumn({ name: "wait_for_completion" })
  milestone: Milestone;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
