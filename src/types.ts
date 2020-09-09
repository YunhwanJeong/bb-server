export type decodedAccessToken = {
  id: number;
  iat: number;
  exp: number;
};

export type MyState = {
  user?: decodedAccessToken;
};
