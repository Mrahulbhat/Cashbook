import Account from "../models/account.model.js";

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

    // Validate required fields
    if (!name || balance === undefined) {
      return res.status(400).json({ message: "Missing required fields: name, balance" });
    }

    // Validate balance is a number and non-negative
    if (typeof balance !== "number" || balance < 0) {
      return res.status(400).json({ message: "Balance must be a non-negative number" });
    }

    // Check if account with same name already exists
    const existingAccount = await Account.findOne({ name });
    if (existingAccount) {
      return res.status(400).json({ message: "Account with this name already exists" });
    }

    // Create account
    const account = new Account({
      name,
      balance,
    });

    // Save account
    const savedAccount = await account.save();
    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update account
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, balance } = req.body;

    // Find the existing account
    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // If name is being updated, check for duplicates
    if (name && name !== account.name) {
      const existingAccount = await Account.findOne({ name });
      if (existingAccount) {
        return res.status(400).json({ message: "Account with this name already exists" });
      }
    }

    // Validate balance if provided
    if (balance !== undefined && (typeof balance !== "number" || balance < 0)) {
      return res.status(400).json({ message: "Balance must be a non-negative number" });
    }

    // Update account fields
    account.name = name || account.name;
    account.balance = balance !== undefined ? balance : account.balance;

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

// Update account balance (for transactions)
export const updateAccountBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validate required fields
    if (amount === undefined) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // Validate amount is a number
    if (typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Update balance
    account.balance += amount;

    // Ensure balance doesn't go negative
    if (account.balance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const updatedAccount = await account.save();
    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
