import { User } from "../entity/User";
import jwt from "jsonwebtoken";
import { Context } from "koa";

export const createAccessToken = ({ id }: User) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = ({ id }: User) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET!, {
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

export const verifyAccessToken = (accessToken: string) => {
  return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
};

export const verifyRefreshToken = (refreshToken: string) => {
  return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
};
