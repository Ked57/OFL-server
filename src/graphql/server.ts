import { ApolloServer, gql } from "apollo-server-express";
import context from "./context";
import createSchema from "./schema";

const createServer = async () => {
  const schema = await createSchema();
  return new ApolloServer({ schema, context });
};

export default createServer;
