import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
} from "type-graphql";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Context } from "koa";

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
    {
      ctx,
    }: {
      ctx: Context;
      payload?: { id: number; username: string; email: string };
    }
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email: inputEmail } });

    if (!user) {
      throw new Error("가입되지 않은 이메일입니다.");
    }
    const { id, username, email, password } = user;

    const isPasswordCorrect = await bcrypt.compare(inputPassword, password);
    if (!isPasswordCorrect) {
      throw new Error("잘못된 비밀번호입니다.");
    }
    ctx.cookies.set(
      "jid",
      jwt.sign({ id, username, email }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: "7d",
      }),
      {
        httpOnly: true,
      }
    );
    return {
      accessToken: jwt.sign(
        { id, username, email },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          expiresIn: "15m",
        }
      ),
    };
  }
}
