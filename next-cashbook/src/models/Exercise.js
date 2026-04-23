import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: ["chest", "legs", "back", "shoulders", "biceps", "triceps", "arms", "pushups", "cardio"]
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

const Exercise = mongoose.models.Exercise || mongoose.model("Exercise", exerciseSchema);
export default Exercise;
