import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";

// Load environment variables early
dotenv.config();

import { connectDB } from "./config/db.js";
import "./config/passport.js";

import transactionRoute from "./routes/transaction.route.js";
import accountRoute from "./routes/account.route.js";
import categoryRoute from "./routes/category.route.js";
import authRoute from "./routes/auth.route.js";


const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// 👇 session (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false
  })
);

// 👇 passport
app.use(passport.initialize());
app.use(passport.session());

const allowedOriginStrings = [
  "http://localhost:5173",
  "https://cashbook-kappa.vercel.app",
  "https://test-cashbook.netlify.app",
  "exp://192.168.29.253:8081", // Expo Metro bundler
  "exp://localhost:8081", // Expo Metro bundler (simulator)
];

// Add FRONTEND_URL from env if it exists
if (process.env.FRONTEND_URL && !allowedOriginStrings.includes(process.env.FRONTEND_URL)) {
  allowedOriginStrings.push(process.env.FRONTEND_URL);
}

// Regex patterns for dynamic origins (Expo, localhost, private IPs)
const allowedOriginPatterns = [
  /^exp:\/\/.*$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check exact string matches
      if (allowedOriginStrings.includes(origin)) {
        return callback(null, true);
      }
      
      // Check regex patterns for Expo/mobile dev servers
      const matchesPattern = allowedOriginPatterns.some((pattern) => {
        return pattern.test(origin);
      });
      
      if (matchesPattern) {
        return callback(null, true);
      }
      
      // In development, be more permissive for mobile testing
      if (process.env.NODE_ENV !== 'production') {
        // Allow localhost and private IPs
        if (
          /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
          /^exp:\/\/.*$/.test(origin)
        ) {
          return callback(null, true);
        }
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// DB
connectDB();

// Routes
app.use("/api/auth", authRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/account", accountRoute);
app.use("/api/category", categoryRoute);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log("server is running on PORT:", PORT);
});
