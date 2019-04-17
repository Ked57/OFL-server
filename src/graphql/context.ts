import { Context } from "apollo-server-core";
import { Request } from "express";
import { authenticate } from "../app";
import { prisma } from "../prisma-client";
import { gql } from "apollo-server";

const inspectSelectionSet = (
  selectionSet: { [key: string]: any },
  stringCondition: string
): boolean => {
  return selectionSet
    ? Object.entries(selectionSet).some(([key, value]) => {
        if (key === "selections") {
          return value.some((v: { [key: string]: any }) =>
            inspectSelectionSet(v, stringCondition)
          );
        } else if (key === "selectionSet") {
          return inspectSelectionSet(value, stringCondition);
        } else if (key === "name") {
          return value.value === stringCondition;
        } else return false;
      })
    : false;
};

const isPublicRequest = (queryString: string) => {
  const query = gql(queryString);
  return query.definitions.some(
    definition =>
      definition.kind === "OperationDefinition" &&
      definition.operation !== "mutation" &&
      !inspectSelectionSet(definition.selectionSet, "userPrivateData")
  );
};

const context: Context = ({ req }: { req: Request }): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const query = req.body.query;
    if (isPublicRequest(query)) {
      resolve();
    }
    if (authenticate(req) && req.session) {
      if (prisma.$exists.user({ battletag: req.session.user.battletag })) {
        resolve();
      }
    }
    reject({ message: "You're not authorized to access this resource" });
  });
};

export default context;
