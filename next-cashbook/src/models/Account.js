import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        balance: {
            type: Number,
            required: true
        },
        isDefault: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

accountSchema.index({ userId: 1, isDefault: 1 });
accountSchema.index({ userId: 1, name: 1 });

const Account = mongoose.models.Account || mongoose.model("Account", accountSchema);
export default Account;
