import Account from "../models/account.model.js";
import Transaction from "../models/transaction.model.js";
import Category from "../models/category.model.js";

import {
  getCache,
  setCache,
  clearCache,
  clearCacheByPrefix,
} from "../config/cache.js";

/* =========================
   GET ALL ACCOUNTS
========================= */
export const getAllAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cacheKey = `accounts:all:${userId}`;
    const cached = getCache(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    const accounts = await Account.find({ userId });
    setCache(cacheKey, accounts);

    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ACCOUNT BY ID
========================= */
export const getAccountData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const cacheKey = `accounts:${id}:${userId}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    setCache(cacheKey, account);
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   ADD NEW ACCOUNT
========================= */
export const addAccount = async (req, res) => {
  try {
    const { name, balance } = req.body;
    const userId = req.user.userId;

    if (!name || balance === undefined) {
      return res
        .status(400)
        .json({ message: "Missing required fields: name, balance" });
    }

    if (typeof balance !== "number" || balance < 0) {
      return res
        .status(400)
        .json({ message: "Balance must be a non-negative number" });
    }

    const existingAccount = await Account.findOne({ name, userId });
    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "Account with this name already exists" });
    }

    const account = new Account({ userId, name, balance });
    const savedAccount = await account.save();

    // invalidate account caches
    clearCacheByPrefix(`accounts:all:${userId}`);

    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE ACCOUNT
========================= */
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, balance } = req.body;
    const userId = req.user.userId;

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Rename account
    if (name && name !== account.name) {
      const existingAccount = await Account.findOne({ name, userId });
      if (existingAccount) {
        return res
          .status(400)
          .json({ message: "Account with this name already exists" });
      }
      account.name = name;
    }

    // Manual balance adjustment
    if (balance !== undefined && balance !== account.balance) {
      if (typeof balance !== "number" || balance < 0) {
        return res
          .status(400)
          .json({ message: "Balance must be a non-negative number" });
      }

      const difference = balance - account.balance;
      const type = difference > 0 ? "income" : "expense";

      const categoryName =
        type === "income"
          ? "Balance_Adjustment_Income"
          : "Balance_Adjustment_Expense";

      const category = await Category.findOne({
        userId,
        name: categoryName,
        type,
      });

      if (!category) {
        return res
          .status(500)
          .json({ message: "Balance Adjustment category missing" });
      }

      await Transaction.create({
        userId,
        amount: Math.abs(difference),
        type,
        description: "Balance Adjustment",
        account: account._id,
        category: category._id,
        date: new Date(),
      });

      account.balance = balance;
    }

    const updatedAccount = await account.save();

    // invalidate caches
    clearCacheByPrefix(`accounts:all:${userId}`);

    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE ACCOUNT
========================= */
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    await Account.findByIdAndDelete(id);

    clearCacheByPrefix(`accounts:all:${userId}`);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ACCOUNT BY NAME
========================= */
export const getAccountByName = async (req, res) => {
  try {
    const { name } = req.params;
    const userId = req.user.userId;
    const cacheKey = `accounts:name:${name}:${userId}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const account = await Account.findOne({ name, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    setCache(cacheKey, account);
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE ACCOUNT BALANCE
========================= */
export const updateAccountBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;

    if (amount === undefined || typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.balance += amount;

    if (account.balance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const updatedAccount = await account.save();

    clearCacheByPrefix(`accounts:all:${userId}`);

    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
