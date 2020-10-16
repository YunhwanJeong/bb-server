import Router from "@koa/router";
import {
  createAccessToken,
  createRefreshToken,
  setRefreshTokenIntoCookie,
  verifyRefreshToken,
} from "../../utils/token";
import { Member } from "../../entities/Member";
import { authorize } from "../../middlewares/api/auth";

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

auth.get("/me", authorize, async (ctx) => {
  const member = await Member.createQueryBuilder("member")
    .select([
      "member.id",
      "member.email",
      "member.username",
      "profile.avatar_url",
    ])
    .leftJoin("member.profile", "profile")
    .where({ id: ctx.state.member!.id })
    .getOne();
  ctx.status = 200;
  ctx.body = member;
});

export default auth;
