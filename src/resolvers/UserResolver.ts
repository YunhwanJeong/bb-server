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
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import { Context, ParameterizedContext } from "koa";
import {
  createAccessToken,
  createRefreshToken,
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
  @Field(() => User)
  user!: User;
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
  async register(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await User.insert({
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
      user,
    };
  }
  @Mutation(() => Boolean)
  async revokeToken(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);
    return true;
  }
}
