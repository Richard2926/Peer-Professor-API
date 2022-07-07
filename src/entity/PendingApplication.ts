import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
} from "typeorm";
import { Helper } from "./Helper";
import { Assignment } from "./Assignment";

@Entity("PendingApplication")
export class PendingApplication extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  helper_id: string;

  @ManyToOne((_) => Helper, (helper) => helper.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "helper_id" })
  helper: Helper;

  @Column({ nullable: false })
  assignment_id: number;

  @ManyToOne((_) => Assignment, (assignment) => assignment.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "assignment_id" })
  assignment: Assignment;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
