import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("ReportType")
export class ReportType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
    nullable: false,
  })
  name: string;

  @CreateDateColumn({
    type: "datetime",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "datetime",
  })
  updated_at: Date;
}
