import Router from "@koa/router";
import { createAccessToken, verifyRefreshToken } from "../../util/token";
import { User } from "../../entity/User";

const auth = new Router();

auth.post("/refresh-token", async (ctx) => {
  const refreshToken = ctx.cookies.get("jid");
  if (!refreshToken) {
    ctx.status = 401;
    ctx.body = { message: "TOKEN_NOT_EXIST", accessToken: "" };
    return;
  }

  let decodedPayload: any = null;
  try {
    decodedPayload = verifyRefreshToken(refreshToken);
  } catch (e) {
    console.log(e);
    ctx.status = 401;
    ctx.body = { message: "INVALID_TOKEN", accessToken: "" };
    return;
  }

  const user = await User.findOne(decodedPayload.id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: "USER_NOT_EXIST", accessToken: "" };
    return;
  }

  return {
    accessToken: createAccessToken(user),
  };
});

export default auth;
