import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { ApolloServer, gql } from "apollo-server-koa";

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

app.listen({ port: 4000 }, () => console.log(`server is running on PORT:4000`));
