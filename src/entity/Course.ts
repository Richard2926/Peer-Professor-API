import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { College } from "./College";

@Entity("Course")
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
    nullable: false,
  })
  department: string;

  @ManyToOne((_) => College, (college) => college.id, { nullable: false })
  @JoinColumn({ name: "college_id" })
  college: College;

  @Column({
    type: "text",
    nullable: false,
  })
  name: string;

  @Column({
    type: "int",
    nullable: false,
  })
  course_no: number;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
