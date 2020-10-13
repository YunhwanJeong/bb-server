import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { MemberProfile } from "./MemberProfile";

@ObjectType()
@Entity("members", { synchronize: true })
export class Member extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  @Field()
  @Column({ length: 50 })
  username!: string;
  @Field()
  @Index()
  @Column({ unique: true, length: 100 })
  email!: string;
  @Column({ length: 60 })
  password!: string;
  @Column({ default: 0 })
  token_version!: number;
  @Field()
  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
  @Field()
  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
  @OneToOne((type) => MemberProfile, (profile) => profile.member)
  profile!: MemberProfile;
}
