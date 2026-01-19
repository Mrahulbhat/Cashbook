import Transaction from "../models/transaction.model.js";
import Account from "../models/account.model.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({ userId })
      .populate("account")
      .populate("category")
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction by ID
export const getTransactionData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({ _id: id, userId })
      .populate("account")
      .populate("category");

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
    const { amount, type, description, category, date, account } = req.body;
    const userId = req.user.userId;

    if (!amount || !type || !category || !date || !account) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const accountExists = await Account.findOne({ _id: account, userId });
    if (!accountExists) {
      return res.status(404).json({ message: "Account not found" });
    }

    const categoryId =
      typeof category === "object" ? category._id : category;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const categoryExists = await Category.findOne({ _id: categoryId, userId });
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const transaction = new Transaction({
      userId,
      amount,
      type: type.toLowerCase(),
      description,
      category: categoryId,
      date,
      account,
    });

    const savedTransaction = await transaction.save();

    const numAmount = Number(amount);
    if (transaction.type === "income") {
      accountExists.balance += numAmount;
    } else {
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
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    let oldAccount = await Account.findOne({ _id: transaction.account, userId });
    const oldAmount = Number(transaction.amount);

    if (transaction.type === "income") {
      oldAccount.balance -= oldAmount;
    } else {
      oldAccount.balance += oldAmount;
    }

    if (account && account !== transaction.account.toString()) {
      const newAccount = await Account.findOne({ _id: account, userId });
      if (!newAccount) {
        return res.status(404).json({ message: "New account not found" });
      }
      await oldAccount.save();
      oldAccount = newAccount;
    }

    transaction.amount = amount ?? transaction.amount;
    transaction.type = type ? type.toLowerCase() : transaction.type;
    transaction.description = description ?? transaction.description;
    transaction.category = category ?? transaction.category;
    transaction.date = date ?? transaction.date;
    transaction.account = account ?? transaction.account;

    const newAmount = Number(transaction.amount);
    if (transaction.type === "income") {
      oldAccount.balance += newAmount;
    } else {
      oldAccount.balance -= newAmount;
    }

    await transaction.save();
    await oldAccount.save();

    const updatedTransaction = await Transaction.findById(id)
      .populate("account")
      .populate("category");

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const account = await Account.findById(transaction.account);
    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      account.balance -= amount;
    } else {
      account.balance += amount;
    }

    await account.save();
    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all transactions
export const deleteAllTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({ userId })
      .populate("account");

    for (const tx of transactions) {
      const amount = Number(tx.amount);

      if (tx.type === "income") {
        tx.account.balance -= amount;
      } else {
        tx.account.balance += amount;
      }

      await tx.account.save();
    }

    await Transaction.deleteMany({ userId });
    res.status(200).json({ message: "All transactions deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionsByAccount = async (req, res) => {
  try {
    const accountId = req.params.accountId || req.params.id || req.query.accountId;
    const userId = req.user.userId;
    
    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ message: "Invalid account id" });
    }

    const accountExists = await Account.findOne({ _id: accountId, userId });
    if (!accountExists) {
      return res.status(404).json({ message: "Account not found" });
    }

    const transactions = await Transaction.find({ account: accountId, userId })
      .populate("account")
      .populate("category")
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId || req.params.id || req.query.categoryId;
    const userId = req.user.userId;
    
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const categoryExists = await Category.findOne({ _id: categoryId, userId });
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const transactions = await Transaction.find({ category: categoryId, userId })
      .populate("account")
      .populate("category")
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionsByDateRange = async (req, res) => {
  try {
    const start = req.query.start || req.query.startDate;
    const end = req.query.end || req.query.endDate;
    const userId = req.user.userId;

    if (!start || !end) {
      return res.status(400).json({ message: "start and end query parameters are required" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format for start or end" });
    }

    const query = {
      userId,
      date: { $gte: startDate, $lte: endDate },
    };

    // Optional filters
    const accountId = req.query.accountId;
    const categoryId = req.query.categoryId;

    if (accountId) {
      if (!mongoose.Types.ObjectId.isValid(accountId)) {
        return res.status(400).json({ message: "Invalid account id" });
      }
      query.account = accountId;
    }

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      query.category = categoryId;
    }

    const transactions = await Transaction.find(query)
      .populate("account")
      .populate("category")
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transferAmount = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { fromAccount, toAccount, amount, description, date } = req.body;

    if (!fromAccount || !toAccount || amount == null) {
      return res.status(400).json({ message: "fromAccount, toAccount and amount are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(fromAccount) || !mongoose.Types.ObjectId.isValid(toAccount)) {
      return res.status(400).json({ message: "Invalid account id(s)" });
    }
    if (fromAccount === toAccount) {
      return res.status(400).json({ message: "fromAccount and toAccount must be different" });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    let result;
    await session.withTransaction(async () => {
      const src = await Account.findById(fromAccount).session(session);
      const dst = await Account.findById(toAccount).session(session);

      if (!src || !dst) {
        throw new Error("Account not found");
      }

      // Optional: enforce sufficient funds
      if (src.balance < numAmount) {
        throw new Error("Insufficient funds");
      }

      src.balance -= numAmount;
      dst.balance += numAmount;

      await src.save({ session });
      await dst.save({ session });

      const txDate = date ? new Date(date) : new Date();
      const outTx = new Transaction({
        amount: numAmount,
        type: "expense",
        description: description ? `${description} (transfer to ${dst.name || toAccount})` : `Transfer to ${dst.name || toAccount}`,
        category: undefined,
        date: txDate,
        account: fromAccount,
      });

      const inTx = new Transaction({
        amount: numAmount,
        type: "income",
        description: description ? `${description} (transfer from ${src.name || fromAccount})` : `Transfer from ${src.name || fromAccount}`,
        category: undefined,
        date: txDate,
        account: toAccount,
      });

      // Bypass validation if schema requires category or other fields not provided
      await outTx.save({ session, validateBeforeSave: false });
      await inTx.save({ session, validateBeforeSave: false });

      result = { message: "Transfer successful", fromTransaction: outTx, toTransaction: inTx };
    });

    session.endSession();
    res.status(200).json(result);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.message === "Insufficient funds") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Account not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};
