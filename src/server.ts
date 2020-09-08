import "reflect-metadata";
import "dotenv-safe/config";
import Koa from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import { ApolloServer } from "apollo-server-koa";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolver/UserResolver";

(async () => {
  await createConnection();

  const app = new Koa();

  app.use(logger());
  app.use(bodyParser());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ ctx }) => ({ ctx }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen({ port: process.env.PORT }, () =>
    console.log(`server is running on PORT:${process.env.PORT}`)
  );
})().catch((error) => console.log(error));
