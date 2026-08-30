import mongoose from "mongoose";

const dsaChallengeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DSAProblem",
            required: true,
        },
        message: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const DSAChallenge = mongoose.models.DSAChallenge || mongoose.model("DSAChallenge", dsaChallengeSchema);
export default DSAChallenge;
