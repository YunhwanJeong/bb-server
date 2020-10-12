import "reflect-metadata";
import "dotenv-safe/config";
import Koa, { Context } from "koa";
import logger from "koa-logger";
import cors from "./middlewares/cors";
import bodyParser from "koa-bodyparser";
import { ApolloServer, ApolloError } from "apollo-server-koa";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { MemberResolver } from "./resolvers/MemberResolver";
import { v4 } from "uuid";
import routes from "./routes";
import { GraphQLError } from "graphql";

(async () => {
  await createConnection();
  const app = new Koa();

  app.use(logger());
  app.use(cors);
  app.use(bodyParser());
  app.use(routes.routes()).use(routes.allowedMethods());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [MemberResolver],
    }),
    context: ({ ctx }: { ctx: Context }) => ctx,
    formatError: (error) => {
      if (error.originalError instanceof ApolloError) {
        return error;
      }
      const errorId = v4();
      console.log("errorId: ", errorId);
      console.log(error);
      return new GraphQLError(`Internal Error: ${errorId}`);
    },
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen({ port: process.env.PORT }, () =>
    console.log(`server is running on PORT:${process.env.PORT}`)
  );
})().catch((e) => console.log(e));
