import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
@Entity("members", { synchronize: true })
export class Member extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  @Field()
  @Column()
  username!: string;
  @Field()
  @Column({ unique: true })
  email!: string;
  @Column()
  password!: string;
  @Column({ default: 0 })
  token_version!: number;
  @Field()
  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
  @Field()
  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
