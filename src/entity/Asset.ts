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
import { Message } from "./Message";
import { Assignment } from "./Assignment";

@Entity("Asset")
export class Asset extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  message_id: number;
  @ManyToOne((_) => Message, (message) => message.id, { nullable: true })
  @JoinColumn({ name: "message_id" })
  message: Message;

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
    type: "text",
    nullable: true,
  })
  path: string;

  @Column({
    type: "text",
    nullable: false,
  })
  name: string;

  @Column({
    type: "text",
    nullable: false,
  })
  extension: string;

  @Column({
    type: "text",
    nullable: false,
  })
  url: string;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
