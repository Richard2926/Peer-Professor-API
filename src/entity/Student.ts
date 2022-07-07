import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from "typeorm";
import { College } from "./College";

@Entity("Student")
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 320,
    unique: true,
  })
  email: string;

  @Column({
    type: "text",
    nullable: false,
  })
  password: string;

  @Column({
    type: "boolean",
    nullable: false,
  })
  verified: boolean;

  @Column({
    type: "text",
    nullable: false,
  })
  username: string;

  @Column({ nullable: false })
  college_id: string;

  @ManyToOne((_) => College, (college) => college.id, { nullable: false })
  @JoinColumn({ name: "college_id" })
  college: College;

  @Column({ nullable: true }) //TODO: Make this false
  stripe_id: string;

  @Column({
    type: "boolean",
    nullable: true, //TODO: Make this false
  })
  payouts_enabled: boolean;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
