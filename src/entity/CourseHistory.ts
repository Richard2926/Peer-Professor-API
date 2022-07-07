import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Helper } from "./Helper";
import { Course } from "./Course";

@Entity("CourseHistory")
export class CourseHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => Helper, (helper) => helper.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "helper_id" })
  helper: Helper;

  @ManyToOne((_) => Course, (course) => course.id, { nullable: false })
  @JoinColumn({ name: "course_id" })
  course: Course;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
