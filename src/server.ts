import "dotenv-safe/config";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { ApolloServer, gql } from "apollo-server-koa";
import { createConnection } from "typeorm";

(async () => {
  await createConnection({
    type: "mysql",
    url: process.env.DATABASE_URL,
  });

  const app = new Koa();

  app.use(bodyParser());

  const typeDefs = gql`
    type Query {
      hello: String
    }
  `;
  const resolvers = {
    Query: {
      hello: () => "Hello world!",
    },
  };

  const apolloServer = new ApolloServer({ typeDefs, resolvers });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen({ port: process.env.PORT }, () =>
    console.log(`server is running on PORT:${process.env.PORT}`)
  );
})().catch((error) => console.log(error));
