import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    name: "connect.sid", // cookie name
    secret: process.env.SESSION_SECRET, // secret for signing the session ID cookie
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    cookie: {
      httpOnly: true, // prevent client-side JS from accessing the cookie
      secure: false, // mark it as unsecure unless using HTTPS
      maxAge: 1000 * 60 * 60 * 72, // 3 days time
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// helper func to validate email format
function isValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username] // check for existing email or username (unique constraint)
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Username or email already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds); // password hashed using bcrypt for industry standard security

    // Insert new user into the database
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    const user = { username, email }; // create a user object to return (needed for state management in frontend)
    res.status(201).json({ message: "User registered successfully." }, user); // send success message and user object
  } catch (err) {
    // error inserting user, we did all checks for validness, so this should be a db error
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Login Route using Passport Local
passport.use(
  new Strategy({ usernameField: "email" }, async function verify(
    email,
    password,
    cb
  ) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length === 0)
        return cb(null, false, {
          message: "User not found.",
        });

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return cb(null, false, { message: "Invalid password." });

      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      // Login failed — no user returned -- this shouldn't happen anw as passport handles all errors supposedly but just in case
      return res.status(401).json({ message: info.message || "Login failed" });
    }

    // Login succeeded
    req.logIn(user, (err) => {
      if (err) return next(err);
      const returnUser = {
        username: user.username,
        email: user.email,
      }; // create a user object to return (needed for state management in frontend) && we don't want to return the password (safer)
      return res
        .status(200)
        .json({ message: "Logged in successfully", returnUser });
    });
  })(req, res, next);
});

app.get(
  //login using google
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle callback after Google login
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login", // frontend login page
    successRedirect: "http://localhost:5173/home", // frontend home page or dashboard
    session: true,
  })
);

// Google Strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.emails[0].value, // profile.emails[0].value is the email returned by Google
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *",
            [
              profile.emails[0].value,
              "google",
              profile.emails[0].value, // insert email as username for google users (display names are not unique)
            ]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user); // serialize user to save in session
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.get("/check-auth", (req, res) => {
  //check if user is authenticated
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout failed:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy failed:", err);
        return res.status(500).json({ message: "Session destroy failed" });
      }

      res.clearCookie("connect.sid");
      console.log("User logged out and session destroyed");
      return res.json({ message: "Logged out successfully" });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
