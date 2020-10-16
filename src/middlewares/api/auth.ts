import { Middleware } from "koa";
import { verifyAccessToken } from "../../utils/token";

export const authorize: Middleware = async (ctx, next) => {
  const {
    headers: { authorization },
  } = ctx;
  if (!authorization) {
    ctx.status = 401;
    ctx.body = { ok: false, code: "NOT_AUTHENTICATED" };
    return;
  }
  const accessToken = authorization.split(" ")[1];
  try {
    const decodedPayload: any = verifyAccessToken(accessToken);
    ctx.state.member = decodedPayload;
  } catch (e) {
    console.log(e);
    ctx.status = 401;
    ctx.body = { ok: false, code: "INVALID_TOKEN" };
    return;
  }
  await next();
};
