import {
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas
} from "graphql-tools";
import fetch from "node-fetch";
import { createHttpLink } from "apollo-link-http";

const createSchema = async () => {
  const prismaLink = createHttpLink({
    uri: `http://localhost:4466`,
    fetch: fetch as any // node-fetch sucks
  });
  const distantSchema = await introspectSchema(prismaLink);

  const remoteExecSchema = makeRemoteExecutableSchema({
    schema: distantSchema,
    link: prismaLink
  });

  return mergeSchemas({ schemas: [remoteExecSchema] });
};

export default createSchema;
