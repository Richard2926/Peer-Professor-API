import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";
import { Student } from "./Student";

@Entity("Helper")
export class Helper extends BaseEntity {

  @PrimaryColumn({ nullable: false })
  student_id: string;

  @OneToOne((_) => Student, (student) => student.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "student_id",
  })
  id: Student;

  @Column({
    type: "text",
    nullable: true,
  })
  bio: string;

  @Column({
    type: "decimal",
    nullable: false,
    scale: 2,
    precision: 10, // max digits for numeric + decimal part
  })
  balance: number;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
