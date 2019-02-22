import { ApolloServer, gql } from "apollo-server-express";
import resolvers from "./resolvers/resolvers";
import context from "./context";
import createSchema from "./schema";

const createServer = async () => {
  const schema = await createSchema();
  return new ApolloServer({ schema, resolvers, context });
};

export default createServer;
