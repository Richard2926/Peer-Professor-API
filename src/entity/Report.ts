import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ReportType } from "./ReportType";
import { Student } from "./Student";

@Entity("Report")
export class Report extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  from_student_id: string;

  @ManyToOne((_) => Student, (student) => student.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "from_student_id" })
  student1: Student;

  @Column({ nullable: false })
  to_student_id: string;

  @ManyToOne((_) => Student, (student) => student.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "to_student_id" })
  student2: Student;

  @Column({ nullable: false })
  report_type: number;

  @ManyToOne((_) => ReportType, (report) => report.id, { nullable: false })
  @JoinColumn({ name: "report_type" })
  reportType: ReportType;

  @Column({
    type: "text",
    nullable: false,
  })
  text: string;

  @Column({
    type: "text",
    nullable: true,
  })
  investigator_notes: string;

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
