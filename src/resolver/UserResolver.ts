import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User } from "../entity/User";
import bcrypt from "bcrypt";

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
}
