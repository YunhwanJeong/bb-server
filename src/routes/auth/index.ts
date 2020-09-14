import Router from "@koa/router";
import {
  createAccessToken,
  createRefreshToken,
  setRefreshTokenIntoCookie,
  verifyRefreshToken,
} from "../../util/token";
import { User } from "../../entity/User";

const auth = new Router();

auth.post("/refresh-token", async (ctx) => {
  const refreshToken = ctx.cookies.get("jid");
  if (!refreshToken) {
    ctx.status = 401;
    ctx.body = { ok: false, code: "TOKEN_NOT_EXIST", accessToken: "" };
    return;
  }

  let decodedPayload: any = null;
  try {
    decodedPayload = verifyRefreshToken(refreshToken);
  } catch (e) {
    console.log(e);
    ctx.status = 401;
    ctx.body = { ok: false, code: "INVALID_TOKEN", accessToken: "" };
    return;
  }

  const user = await User.findOne(decodedPayload.id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { ok: false, code: "USER_NOT_EXIST", accessToken: "" };
    return;
  }

  if (decodedPayload.tokenVersion !== user.tokenVersion) {
    ctx.status = 401;
    ctx.body = { ok: false, code: "TOKEN_REVOKED", accessToken: "" };
    return;
  }

  setRefreshTokenIntoCookie(ctx, createRefreshToken(user));
  ctx.body = {
    ok: true,
    accessToken: createAccessToken(user),
  };
});

export default auth;
