import express from "express";
import createServer from "./graphql/server";

const app = express();
createServer()
  .then(server => {
    server.applyMiddleware({ app });
    app.listen({ port: 4000 }, () =>
      console.log(
        `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
      )
    );
  })
  .catch(err => console.error(err));
