import Account from "../models/account.model.js";
import Transaction from "../models/transaction.model.js";
import Category from "../models/category.model.js";

// Get all accounts
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get account by ID
export const getAccountData = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new account
export const addAccount = async (req, res) => {
  try {
    const { name, balance } = req.body;

    if (!name || balance === undefined) {
      return res.status(400).json({ message: "Missing required fields: name, balance" });
    }

    if (typeof balance !== "number" || balance < 0) {
      return res.status(400).json({ message: "Balance must be a non-negative number" });
    }

    const existingAccount = await Account.findOne({ name });
    if (existingAccount) {
      return res.status(400).json({ message: "Account with this name already exists" });
    }

    const account = new Account({ name, balance });
    const savedAccount = await account.save();

    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update account (NAME + MANUAL BALANCE ADJUSTMENT)
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, balance } = req.body;

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Rename account
    if (name && name !== account.name) {
      const existingAccount = await Account.findOne({ name });
      if (existingAccount) {
        return res.status(400).json({ message: "Account with this name already exists" });
      }
      account.name = name;
    }

    // Manual balance change → create Balance Adjustment transaction
    if (balance !== undefined && balance !== account.balance) {
      if (typeof balance !== "number" || balance < 0) {
        return res.status(400).json({ message: "Balance must be a non-negative number" });
      }

      const difference = balance - account.balance;
      const type = difference > 0 ? "income" : "expense";

      const category = await Category.findOne({
        name: "Balance Adjustment",
        type,
      });

      if (!category) {
        return res.status(500).json({
          message: "Balance Adjustment category missing",
        });
      }

      await Transaction.create({
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
    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    await Account.findByIdAndDelete(id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get account by name
export const getAccountByName = async (req, res) => {
  try {
    const { name } = req.params;

    const account = await Account.findOne({ name });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Used ONLY when adding/editing transactions
export const updateAccountBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined || typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.balance += amount;

    if (account.balance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const updatedAccount = await account.save();
    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
