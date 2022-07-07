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
import { Helper } from "./Helper";
import { Course } from "./Course";
import { College } from "./College";

@Entity("Assignment")
export class Assignment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
    nullable: false,
  })
  name: string;

  @Column({
    type: "text",
    nullable: false,
  })
  description: string;

  @Column({ nullable: false })
  creator_id: string;

  @ManyToOne((_) => Student, (student) => student.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "creator_id" })
  creator: Student;

  @Column({ nullable: true })
  helper_id: string;

  @ManyToOne((_) => Helper, (helper) => helper.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "helper_id" })
  helper: Helper;

  @Column({ nullable: false })
  course_id: number;

  @ManyToOne((_) => Course, (course) => course.id, { nullable: false })
  @JoinColumn({ name: "course_id" })
  course: Course;

  @Column({ nullable: false })
  college_id: number;

  @ManyToOne((_) => College, (college) => college.id, { nullable: false })
  @JoinColumn({ name: "college_id" })
  college: College;

  @Column({
    type: "datetime",
    nullable: false,
  })
  accept_by: Date;

  @Column({
    type: "boolean",
    nullable: false,
  })
  active: boolean;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
