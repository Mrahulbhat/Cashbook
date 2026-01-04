import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import transactionRoute from "./routes/transaction.route.js";
import accountRoute from "./routes/account.route.js";
import categoryRoute from "./routes/category.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://cashbook-kappa.vercel.app",
  "https://cashbook-test.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);

// DB
connectDB();

// Routes
app.use("/api/transaction", transactionRoute);
app.use("/api/account", accountRoute);
app.use("/api/category", categoryRoute);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log("server is running on PORT:", PORT);
});
