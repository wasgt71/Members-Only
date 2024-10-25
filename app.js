const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const signUpRouter = require("./routes/sign-up");
const indexRouter = require("./routes/indexRouter");
const messageRouter = require("./routes/messagerouter");

const pool = new Pool({
  user: "tristanwassilyn",
  host: "localhost",
  database: "users",
  password: "12345678",
  port: 5432,
});

const messages = [{
message: "Hey how are you!",
}];


const path = require("node:path");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use("message", messageRouter);
app.use("sign-up", signUpRouter);
app.use("/", indexRouter);

app.get("/message", (req, res) => res.render("messageform"));
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.get("/", (req, res) => res.render("index", { user: req.user, messages: messages } ));
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM userinfo WHERE username = $1",
        [username]
      );
      const user = rows[0];
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((userinfo, done) => {
  done(null, userinfo.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM userinfo WHERE id = $1", [
      id,
    ]);
    const userinfo = rows[0];

    done(null, userinfo);
  } catch (err) {
    done(err);
  }
});

app.post("/sign-up", async (req, res, next) => {
  try {
    await pool.query(
      "INSERT INTO userinfo (username, password) VALUES ($1, $2)",
      [req.body.username, req.body.password]
    );
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
});

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.post("/write-message", (req, res) => {
const message = req.body;
messages.push(message);
res.redirect("/");
})


app.listen(3000, () => console.log("app listening on port 3000!"));
