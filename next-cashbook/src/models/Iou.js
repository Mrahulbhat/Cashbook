import mongoose from "mongoose";

const iouSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        friendName: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paidBack: {
            type: Number,
            default: 0,
        },
        direction: {
            type: String,
            enum: ["i_paid"],
            default: "i_paid",
        },
        description: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "partially_paid", "settled"],
            default: "pending",
        },
        linkedTransactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            default: null,
        },
        settlementTransactionIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Transaction",
            },
        ],
    },
    { timestamps: true }
);

const Iou = mongoose.models.Iou || mongoose.model("Iou", iouSchema);
export default Iou;
