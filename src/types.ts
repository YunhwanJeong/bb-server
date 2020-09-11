import { ExtendableContext } from "koa";

export type DecodedAccessToken = {
  id: number;
  iat: number;
  exp: number;
};

export type MyState = {
  user?: DecodedAccessToken;
};
