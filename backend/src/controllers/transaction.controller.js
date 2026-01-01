import Transaction from "../models/transaction.model.js";
import Account from "../models/account.model.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("account").populate("category");

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction by ID
export const getTransactionData = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate("account").populate("category");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new transaction
export const addTransaction = async (req, res) => {
  try {
    console.log("RAW category from req.body:", req.body.category);
    console.log("Type of category:", typeof req.body.category);
    const { amount, type, description, category, date, account } = req.body;

    // Validate required fields
    if (!amount || !type || !category || !date || !account) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify account exists
    const accountExists = await Account.findById(account);
    if (!accountExists) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Verify category exists
    const categoryId =
      typeof category === "object" ? category._id : category;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create transaction
    const transaction = new Transaction({
      amount,
      type,
      description,
      category: categoryId,
      date,
      account,
    });

    // Save transaction
    const savedTransaction = await transaction.save();

    // Update account balance
    const numAmount = Number(amount);
    if (type.toLowerCase() === "income") {
      accountExists.balance += numAmount;
    } else if (type.toLowerCase() === "expense") {
      accountExists.balance -= numAmount;
    }

    await accountExists.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description, category, date, account } = req.body;

    // Find the existing transaction
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Get the old account to revert balance changes
    let oldAccount = await Account.findById(transaction.account);

    // Revert old transaction from account balance
    const oldAmount = Number(transaction.amount);
    if (transaction.type.toLowerCase() === "income") {
      oldAccount.balance -= oldAmount;
    } else if (transaction.type.toLowerCase() === "expense") {
      oldAccount.balance += oldAmount;
    }

    // If account changed, update the new one
    if (account && account !== transaction.account.toString()) {
      const newAccount = await Account.findById(account);
      if (!newAccount) {
        return res.status(404).json({ message: "New account not found" });
      }
      await oldAccount.save();
      oldAccount = newAccount;
    }

    // Update transaction fields
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.description = description || transaction.description;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.account = account || transaction.account;

    // Apply new transaction to account balance
    const newAmount = Number(transaction.amount);
    if (transaction.type.toLowerCase() === "income") {
      oldAccount.balance += newAmount;
    } else if (transaction.type.toLowerCase() === "expense") {
      oldAccount.balance -= newAmount;
    }

    await transaction.save();
    await oldAccount.save();

    const updatedTransaction = await Transaction.findById(id).populate("account").populate("category");
    ;
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Get the account and revert balance changes
    const account = await Account.findById(transaction.account);
    const amount = Number(transaction.amount);

    if (transaction.type.toLowerCase() === "income") {
      account.balance -= amount;
    } else if (transaction.type.toLowerCase() === "expense") {
      account.balance += amount;
    }

    await account.save();
    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transactions by account
export const getTransactionsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const transactions = await Transaction.find({ account: accountId }).populate("account").populate("category");
    ;
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const transactions = await Transaction.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).populate("account").populate("category");
    ;

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transactions by category
export const getTransactionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const transactions = await Transaction.find({ category }).populate("account").populate("category");
    ;
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Transfer amounts between accounts
export const transferAmount = async (req, res) => {
  const { fromAccountId, toAccountId, amount, category: categoryName = "Investment" } = req.body;

  try {
    // Validate input
    if (!fromAccountId || !toAccountId || amount === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    // Start a mongoose session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find accounts
      const fromAccount = await Account.findById(fromAccountId).session(session);
      const toAccount = await Account.findById(toAccountId).session(session);

      if (!fromAccount || !toAccount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Account not found." });
      }

      // Check if sufficient balance
      if (fromAccount.balance < amountNum) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Insufficient balance." });
      }

      // Update balances
      fromAccount.balance -= amountNum;
      toAccount.balance += amountNum;

      await fromAccount.save({ session });
      await toAccount.save({ session });

      // Ensure category exists (create if missing)
      let category = await Category.findOne({ name: categoryName }).session(session);
      if (!category) {
        category = new Category({ name: categoryName, type: "expense", parentCategory: categoryName });
        await category.save({ session });
      }

      const date = new Date();

      const expense = new Transaction({
        amount: amountNum,
        type: "expense",
        category: category._id,
        date,
        account: fromAccountId,
      });

      const income = new Transaction({
        amount: amountNum,
        type: "income",
        category: category._id,
        date,
        account: toAccountId,
      });


      await expense.save({ session });
      await income.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: "Transfer successful.", expense, income });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("account").populate("category");
    ;

    for (const tx of transactions) {
      const amount = Number(tx.amount);

      if (tx.type.toLowerCase() === "income") {
        tx.account.balance -= amount;
      } else {
        tx.account.balance += amount;
      }

      await tx.account.save();
    }

    await Transaction.deleteMany();
    res.status(200).json({ message: "All transactions deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




