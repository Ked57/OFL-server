import { Context } from "apollo-server-core";
import { Request } from "express";

const isPublicRequest = (query: string) => {
  return !query.includes("mutation") && !query.includes("UserPrivateData");
};

const isRestrictedRequest = (query: string) => {
  if (query.includes("mutation")) {
    return true;
  } else if (query.includes("query") && query.includes("UserPrivateData")) {
    return true;
  } else {
    return false;
  }
};

const extractUserIdFromRequest = (query: string) => {
  return "cjsg1cvut00060719sozapl0h";
};

// We should generate typescript types once the schema is done
const getUserFromToken = (token: string) => {
  return {
    id: "cjsg1cvut00060719sozapl0h",
    name: "User",
    isAdmin: true
  };
};

const context: Context = ({ req }: { req: Request }) => {
  return new Promise((resolve, reject) => {
    if (isPublicRequest(req.body.query)) {
      resolve();
    }
    if (!req.headers.authorization) {
      reject({ message: "Unauthorized: no header" });
    }
    const bearer = req.headers.authorization as string;
    const token = bearer.split(" ")[1] || "";
    const user = getUserFromToken(token);
    if (isRestrictedRequest(req.body.query)) {
      if (
        user.isAdmin ||
        extractUserIdFromRequest(req.body.variables) === user.id
      ) {
        resolve({
          user: {
            name: "UserName"
          }
        });
      } else {
        reject({ message: "Unauthorized: access restricted" });
      }
    } else resolve();
  });
};

export default context;
