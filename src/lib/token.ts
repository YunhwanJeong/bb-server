import { User } from "../entity/User";
import jwt from "jsonwebtoken";
import { Context } from "koa";

export const createAccessToken = ({ id, username, email }: User) => {
  return jwt.sign({ id, username, email }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = ({ id, username, email }: User) => {
  return jwt.sign({ id, username, email }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

export const setRefreshTokenIntoCookie = (
  ctx: Context,
  refreshToken: string
) => {
  return ctx.cookies.set("jid", refreshToken, {
    httpOnly: true,
  });
};
