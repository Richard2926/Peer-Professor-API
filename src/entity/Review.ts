import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { Student } from "./Student";
import { Helper } from "./Helper";

@Entity("Review")
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => Student, (student) => student.id, {
    nullable: false,
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

  @Column({
    type: "int",
    nullable: false,
  })
  rating: number;

  @Column({
    type: "text",
    nullable: true,
  })
  text: string;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
