import mongoose from "mongoose";
import Category from './Category';

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ["income", "expense", "investment"],
            required: true
        },
        purchaseImportance: {
            type: String,
            enum: ["critical", "necessary", "moderate", "want_expensive", "avoidable_major"],
            required: function () {
                return this.type === "expense";
            },
        },
        description: {
            type: String,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: function () {
                return this.type !== "investment";
            }
        },
        date: {
            type: Date,
            required: true
        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true
        },
        toAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        },

    },
    { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1, createdAt: -1 });
transactionSchema.index({ userId: 1, account: 1 });
transactionSchema.index({ userId: 1, category: 1 });

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default Transaction;
