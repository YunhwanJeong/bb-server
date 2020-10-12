import Router from "@koa/router";
import {
  createAccessToken,
  createRefreshToken,
  setRefreshTokenIntoCookie,
  verifyRefreshToken,
} from "../../utils/token";
import { Member } from "../../entities/Member";

const auth = new Router();

auth.post("/refresh-token", async (ctx) => {
  const refreshToken = ctx.cookies.get("dami");
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

  const member = await Member.findOne(decodedPayload.id);
  if (!member) {
    ctx.status = 404;
    ctx.body = { ok: false, code: "MEMBER_NOT_EXIST", accessToken: "" };
    return;
  }

  if (decodedPayload.token_version !== member.token_version) {
    ctx.status = 401;
    ctx.body = { ok: false, code: "TOKEN_REVOKED", accessToken: "" };
    return;
  }

  setRefreshTokenIntoCookie(ctx, createRefreshToken(member));
  ctx.body = {
    ok: true,
    accessToken: createAccessToken(member),
  };
});

export default auth;
