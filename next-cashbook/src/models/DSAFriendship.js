import mongoose from "mongoose";

const dsaFriendshipSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

dsaFriendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

const DSAFriendship = mongoose.models.DSAFriendship || mongoose.model("DSAFriendship", dsaFriendshipSchema);
export default DSAFriendship;