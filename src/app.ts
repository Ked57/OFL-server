import express from "express";
import createServer from "./graphql/server";
import BnetStrategy from "passport-bnet";
import passport from "passport";

const BNET_ID = process.env.BNET_ID || "";
const BNET_SECRET = process.env.BNET_SECRET || "";

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

passport.use(
  new BnetStrategy(
    {
      clientID: BNET_ID,
      clientSecret: BNET_SECRET,
      callbackURL: "https://localhost:3000/auth/bnet/callback",
      region: "us"
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: unknown,
      done: any
    ) => {
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);
      console.log(done);
      return done(null, profile);
    }
  )
);

app.get("/auth/bnet", passport.authenticate("bnet"));

app.get(
  "/auth/bnet/callback",
  passport.authenticate("bnet", { failureRedirect: "/" }),
  (req, res) => {
    console.log("auth success");
    console.log(res);
    res.redirect("/");
  }
);
