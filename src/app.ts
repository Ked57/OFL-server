import express, { Request } from "express";
import createServer from "./graphql/server";
import BnetStrategy from "passport-bnet";
import passport from "passport";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { isUserExists, registerUser, getUserById } from "./user/user";
import { UserCreateInput } from "./prisma-client";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const BNET_ID = process.env.BNET_ID || "";
const BNET_SECRET = process.env.BNET_SECRET || "";
const DOMAIN = process.env.DOMAIN || "";
const CALLBACKURL = process.env.CALLBACKURL || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "";

const app = express();

app.use(cookieParser());
app.use(bodyParser({ extended: false }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.cookies.user_sid && (req.session && !req.session.user)) {
    res.clearCookie("user_sid");
  }
  next();
});

export const authenticate = (req: Request) => {
  if (req.session && req.session.user) {
    return true;
  } else {
    return false;
  }
};

passport.serializeUser((user: { battletag: string }, done) => {
  done(null, user.battletag);
});

passport.deserializeUser(async (battletag: string, done) => {
  try {
    done(null, await getUserById(battletag));
  } catch (err) {
    done(err, undefined);
  }
});

passport.use(
  new BnetStrategy(
    {
      clientID: BNET_ID,
      clientSecret: BNET_SECRET,
      callbackURL: CALLBACKURL,
      region: "us"
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: unknown,
      done: any
    ) => {
      return done(null, profile);
    }
  )
);

app.get("/", (req, res) => {
  if (!authenticate(req)) {
    res.send(
      `<a href="https://overwatch-league-fantasy.localtunnel.me/auth/bnet/">Login with Bnet</a>`
    );
  } else {
    res.send(
      `You're already connected ! <a href="https://overwatch-league-fantasy.localtunnel.me/logout">Logout</a>`
    );
  }
});

app.get("/login-failure", (req, res) => {
  res.send("Login failed");
});

app.get("/logout", (req, res) => {
  req.logout();
  if (req.session) {
    req.session.destroy(err =>
      err ? console.error("Error destroying session", err) : () => {}
    );
  }
  res.send("You've been logged out");
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
    { failureRedirect: DOMAIN + "/login-failure" },
    async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!(await isUserExists(user.battletag))) {
        const userToRegister: UserCreateInput = {
          battletag: user.battletag,
          userPrivateData: {
            create: {
              sub: user.sub,
              provider: user.provider,
              token: user.token
            }
          }
        };
        try {
          await registerUser(userToRegister);
        } catch (err) {
          res.sendStatus(500).send(err);
          throw new Error(err);
        }
      }
      req.login(user, err =>
        err ? console.error("ERROR: trying to login user", err) : () => {}
      );
      if (req.session) {
        req.session.user = user;
        req.session.save(err => {
          if (err) console.log("Error during session saving", err);
          res.redirect(DOMAIN + "/");
        });
      }
    }
  )(req, res, next);
});

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
