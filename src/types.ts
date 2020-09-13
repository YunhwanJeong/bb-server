export type DecodedAccessToken = {
  id: number;
  iat: number;
  exp: number;
};

export type MyState = {
  user?: DecodedAccessToken;
};

export type MyContext = {
  error?: (status: number, message: string) => Promise<void>;
};
