import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Check if env vars are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    `Google OAuth credentials missing. GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? "✓" : "✗"}, GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? "✓" : "✗"}`
  );
}

// Determine callback URL based on environment
const getCallbackURL = () => {
  const backendURL = process.env.BACKEND_URL || "http://localhost:5001";
  return `${backendURL}/api/auth/google/callback`;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL()
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
