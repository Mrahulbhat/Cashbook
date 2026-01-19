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

const allowedOrigins = [
  "http://localhost:5173",
  "https://cashbook-kappa.vercel.app",
  "https://test-cashbook.netlify.app"
];

// Add FRONTEND_URL from env if it exists
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true
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
