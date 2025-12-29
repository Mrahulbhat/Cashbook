import express from "express";
import {
  getAllTransactions,
  getTransactionData,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByAccount,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  transferAmount,
  deleteAllTransactions,
} from "../controllers/transaction.controller.js";

const router = express.Router();

// Get all transactions
router.get("/", getAllTransactions);

// Get transactions by date range
router.get("/date-range", getTransactionsByDateRange);

// Get transactions by account
router.get("/account/:accountId", getTransactionsByAccount);

// Get transactions by category
router.get("/category/:category", getTransactionsByCategory);

// Get single transaction
router.get("/:id", getTransactionData);

// Add new transaction
router.post("/new", addTransaction);

// Update transaction
router.put("/:id", updateTransaction);

// IMPORTANT: keep this ABOVE '/:id'
router.delete("/delete-all", deleteAllTransactions);
router.delete("/transaction/:id", deleteTransaction);

// Route for transferring amounts between accounts
router.post("/transfer", transferAmount);

export default router;
