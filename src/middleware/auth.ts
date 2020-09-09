import { MiddlewareFn } from "type-graphql";
import { ParameterizedContext } from "koa";
import { verifyAccessToken } from "../lib/token";
import { MyState } from "../types";

export const authorize: MiddlewareFn<ParameterizedContext<MyState>> = async (
  { context },
  next
) => {
  const {
    request: {
      header: { authorization },
    },
  } = context;
  if (!authorization) {
    throw new Error("not authenticated");
  }
  const accessToken = authorization.split(" ")[1];
  try {
    const decoded: any = verifyAccessToken(accessToken);
    context.state.user = decoded;
  } catch (error) {
    console.log(error);
    throw new Error("not authenticated");
  }
  await next();
};
