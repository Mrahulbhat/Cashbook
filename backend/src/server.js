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
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    //   "https://service-care-kappa.vercel.app"
    ],
    credentials: true,
  })
);

// Connect to database
connectDB();

// Routes
app.use("/api/transaction", transactionRoute);
app.use("/api/account", accountRoute);
app.use("/api/category", categoryRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log("server is running on PORT:", PORT);
});
