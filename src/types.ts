export type DecodedAccessToken = {
  id: number;
  tokenVersion: number;
  iat: number;
  exp: number;
};

export type MyState = {
  member?: DecodedAccessToken;
};
