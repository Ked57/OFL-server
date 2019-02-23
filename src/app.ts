import express from "express";
import createServer from "./graphql/server";
import BnetStrategy from "passport-bnet";
import passport from "passport";

let constants = {
  DOMAIN: "",
  CALLBACKURL: ""
};

if (process.env.NODE_ENV === "production") {
  constants.DOMAIN = "";
  constants.CALLBACKURL = "/auth/bnet/callback";
} else {
  constants.DOMAIN = "http://localhost";
  constants.CALLBACKURL =
    "https://overwatch-league-fantasy.localtunnel.me/auth/bnet/callback";
}

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
      callbackURL: constants.CALLBACKURL,
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
      return done(null, profile);
    }
  )
);

app.get("/", (req, res) => {
  res.send(
    `<a href="https://overwatch-league-fantasy.localtunnel.me/auth/bnet/">Login with Bnet</a>`
  );
});

/*=========================
   Bnet OAuth2 Navigate to
===========================*/
app.get("/auth/bnet", (req, res, next) => {
  passport.authenticate("bnet", (err, user, info) => {
    if (err) {
      return next(err);
    }
  })(req, res, next);
});

/*============================
   Bnet OAuth2 Callback Route
==============================*/
app.get("/auth/bnet/callback", (req, res, next) => {
  passport.authenticate(
    "bnet",
    { failureRedirect: constants.DOMAIN + "/loginFailure" },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      console.log(user);
      res.redirect(constants.DOMAIN + "/loginSuccess");
    }
  )(req, res, next);
});
