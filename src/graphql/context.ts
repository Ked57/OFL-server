import { Context } from "apollo-server-core";
import { Request } from "express";

const isPublicRequest = (body: string) => {
  return false;
};

const isRestrictedRequest = (body: string) => {
  if (body.includes("mutation")) {
    return true;
  } else if (body.includes("query") && body.includes("UserPrivateData")) {
    return true;
  } else {
    return false;
  }
};

const extractUserIdFromRequest = (body: string) => {
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
    if (isPublicRequest(req.body)) {
      resolve();
    }
    if (!req.headers.authorization) {
      reject({ message: "Unauthorized" });
    }
    const user = getUserFromToken("token");
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
        reject({ message: "Unauthorized" });
      }
    } else resolve();
  });
};

export default context;
