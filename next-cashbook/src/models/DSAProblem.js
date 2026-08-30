import mongoose from "mongoose";

const dsaProblemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        topic: {
            type: String,
            required: true,
            trim: true,
        },
        source: {
            type: String,
            required: true,
            trim: true,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        problemUrl: {
            type: String,
            trim: true,
            default: "",
        },
        solutionUrl: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["todo", "solved"],
            default: "todo",
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

const DSAProblem = mongoose.models.DSAProblem || mongoose.model("DSAProblem", dsaProblemSchema);
export default DSAProblem;
