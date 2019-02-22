import { Context } from "apollo-server-core";
import { Request } from "express";

const context: Context = ({ req }: { req: Request }) => {
  return {
    // this is a mock
    user: {
      name: "UserName"
    }
  };
};

export default context;
