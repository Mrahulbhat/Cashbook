import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workTitle: {
            type: String,
            required: true,
            trim: true,
        },
        deadline: {
            type: Date,
        },
        workType: {
            type: String,
            enum: ["New Scripting", "R&D", "Regression", "Other"],
            default: "Other",
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

if (mongoose.models.Todo && !mongoose.models.Todo.schema.path("workType")) {
    mongoose.deleteModel("Todo");
}

const Todo = mongoose.models.Todo || mongoose.model("Todo", todoSchema);
export default Todo;