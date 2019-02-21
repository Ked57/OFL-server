import { ApolloServer, gql } from "apollo-server-express";
import resolvers from "./resolvers/resolvers";
import context from "./context";

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({ typeDefs, resolvers, context });

export default server;
