import express from "express";
import {
  getAllAccounts,
  getAccountData,
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountByName,
  updateAccountBalance,
} from "../controllers/account.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all accounts
router.get("/", getAllAccounts);

// Get account by name
router.get("/name/:name", getAccountByName);

// Get single account by ID
router.get("/:id", getAccountData);

// Add new account
router.post("/new", addAccount);

// Update account
router.put("/:id", updateAccount);

// Update account balance
router.patch("/:id/balance", updateAccountBalance);

// Delete account
router.delete("/:id", deleteAccount);

export default router;
