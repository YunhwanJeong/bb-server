import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Member } from "../entities/Member";
import bcrypt from "bcrypt";
import { Context, ParameterizedContext } from "koa";
import {
  createAccessToken,
  createRefreshToken,
  deleteCookie,
  setRefreshTokenIntoCookie,
} from "../utils/token";
import { authorize } from "../middlewares/auth";
import { MyState } from "../types";
import { AuthenticationError, UserInputError } from "apollo-server-koa";
import { getConnection } from "typeorm";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken!: string;
  @Field(() => Member)
  member!: Member;
}

@Resolver()
export class MemberResolver {
  @Query(() => [Member])
  async members() {
    return await Member.find();
  }
  @Query(() => Member, { nullable: true })
  @UseMiddleware(authorize)
  async me(@Ctx() ctx: ParameterizedContext<MyState>) {
    return await Member.findOne(ctx.state.member!.id);
  }
  @Mutation(() => Boolean)
  async register(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await Member.insert({
        username,
        email,
        password: hashedPassword,
      });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        throw new UserInputError("already registered email");
      }
    }
    return true;
  }
  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") inputEmail: string,
    @Arg("password") inputPassword: string,
    @Ctx()
    ctx: Context
  ): Promise<LoginResponse> {
    const member = await Member.findOne({ where: { email: inputEmail } });
    if (!member) {
      throw new AuthenticationError("not registered email");
    }
    const isPasswordCorrect = await bcrypt.compare(
      inputPassword,
      member.password
    );
    if (!isPasswordCorrect) {
      throw new AuthenticationError("incorrect password");
    }

    setRefreshTokenIntoCookie(ctx, createRefreshToken(member));
    return {
      accessToken: createAccessToken(member),
      member,
    };
  }
  @Mutation(() => Boolean)
  async revokeToken(@Ctx() ctx: Context, @Arg("memberId") memberId: string) {
    await getConnection()
      .getRepository(Member)
      .increment({ id: memberId }, "token_version", 1);
    deleteCookie(ctx);
    return true;
  }
}
