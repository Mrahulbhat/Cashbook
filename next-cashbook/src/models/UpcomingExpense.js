import mongoose from "mongoose";

const upcomingExpenseSchema = new mongoose.Schema(
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
        description: {
            type: String,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'cancelled'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

const UpcomingExpense = mongoose.models.UpcomingExpense || mongoose.model("UpcomingExpense", upcomingExpenseSchema);

export default UpcomingExpense;
