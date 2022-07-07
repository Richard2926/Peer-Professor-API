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
  
  @Entity("Notification")
  export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      type: "text",
      nullable: false,
    })
    text: string;

    @Column({
      type: "text",
      nullable: false,
    })
    url: string;

    @Column({ nullable: false })
    student_id: string;
    @ManyToOne((_) => Student, (student) => student.id, {
      nullable: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "student_id" })
    student: Student;

    @CreateDateColumn({
      type: "datetime",
    })
    created_at: Date;

    @UpdateDateColumn({
      type: "datetime",
    })
    updated_at: Date;
  }
  