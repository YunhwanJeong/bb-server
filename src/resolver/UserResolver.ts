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
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { Context, ParameterizedContext } from "koa";
import {
  createAccessToken,
  createRefreshToken,
  setRefreshTokenIntoCookie,
} from "../lib/token";
import { authorize } from "../middleware/auth";
import { MyState } from "../types";

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
  @Mutation(() => Boolean)
  async registerUser(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.insert({
        username,
        email,
        password: hashedPassword,
      });
    } catch (error) {
      console.log(error);
      return false;
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
      throw new Error("가입되지 않은 이메일입니다.");
    }

    const isPasswordCorrect = await bcrypt.compare(
      inputPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      throw new Error("잘못된 비밀번호입니다.");
    }
    const refreshToken = createRefreshToken(user);
    setRefreshTokenIntoCookie(ctx, refreshToken);
    return {
      accessToken: createAccessToken(user),
    };
  }
  @Query(() => User, { nullable: true })
  @UseMiddleware(authorize)
  async me(@Ctx() ctx: ParameterizedContext<MyState>) {
    return await User.findOne(ctx.state.user!.id);
  }
}
