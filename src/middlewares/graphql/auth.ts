import { MiddlewareFn } from "type-graphql";
import { ParameterizedContext } from "koa";
import { verifyAccessToken } from "../../utils/token";
import { MyState } from "../../types";
import { AuthenticationError } from "apollo-server-koa";

export const authorize: MiddlewareFn<ParameterizedContext<MyState>> = async (
  { context },
  next
) => {
  const {
    request: {
      header: { authorization },
    },
  } = context;
  if (!authorization) throw new AuthenticationError("not authenticated");
  const accessToken = authorization.split(" ")[1];
  try {
    const decodedPayload: any = verifyAccessToken(accessToken);
    context.state.member = decodedPayload;
  } catch (e) {
    console.log(e);
    throw new AuthenticationError("invalid Token");
  }
  await next();
};
