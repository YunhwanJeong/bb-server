import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;
  @Field()
  @Column()
  username!: string;
  @Field()
  @Column({ unique: true })
  email!: string;
  @Column()
  password!: string;
  @Column({ default: 0 })
  tokenVersion!: number;
}
