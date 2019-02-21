import { Context } from "apollo-server-core";
import { Request } from "express";

const context: Context = ({ req }: { req: Request }) => {
  console.log(req.body.query);
  return { authorized: false };
};

export default context;
