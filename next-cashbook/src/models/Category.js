import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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
        type: {
            type: String, //income or expense
            required: true
        },
        parentCategory: {
            type: String,
            required: true
        },
        budget: {
            type: String,
        },
    },
    { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
