import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
} from "type-graphql";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { Context, ParameterizedContext } from "koa";
import {
  createAccessToken,
  createRefreshToken,
  setRefreshTokenIntoCookie,
} from "../util/token";
import { authorize } from "../middleware/auth";
import { MyState } from "../types";
import { AuthenticationError } from "apollo-server-koa";
import { getConnection } from "typeorm";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken!: string;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users() {
    return await User.find();
  }
  @Query(() => User, { nullable: true })
  @UseMiddleware(authorize)
  async me(@Ctx() ctx: ParameterizedContext<MyState>) {
    return await User.findOne(ctx.state.user!.id);
  }
  @Mutation(() => Boolean)
  async registerUser(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.insert({
      username,
      email,
      password: hashedPassword,
    });
    return true;
  }
  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") inputEmail: string,
    @Arg("password") inputPassword: string,
    @Ctx()
    ctx: Context
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email: inputEmail } });
    if (!user) {
      throw new AuthenticationError("not registered email");
    }
    const isPasswordCorrect = await bcrypt.compare(
      inputPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      throw new AuthenticationError("incorrect password");
    }

    setRefreshTokenIntoCookie(ctx, createRefreshToken(user));
    return {
      accessToken: createAccessToken(user),
    };
  }
  @Mutation(() => Boolean)
  async revokeRefreshToken(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);
    return true;
  }
}
