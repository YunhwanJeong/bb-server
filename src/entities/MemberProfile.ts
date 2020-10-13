import { Field, ID, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Member } from "./Member";

@ObjectType()
@Entity("member_profiles", { synchronize: true })
export class MemberProfile extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null, length: 50 })
  occupation?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null, length: 50 })
  company?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  avatar_url?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  banner_url?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  homepage_url?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  github_url?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  linkedin_url?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  blog_url?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  rocketpunch_url?: string;
  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  sns_url?: string;
  @Field(() => Int)
  @Column({ default: 0, nullable: false })
  followers!: number;
  @Field(() => Int)
  @Column({ default: 0, nullable: false })
  following!: number;
  @OneToOne((type) => Member, (member) => member.profile, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "fk_member_id" })
  member!: Member;
  @Field()
  @UpdateDateColumn({ type: "timestamp" })
  created_at!: Date;
  @Field()
  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
