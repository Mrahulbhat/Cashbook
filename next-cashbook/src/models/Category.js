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
        budget: {
            type: String,
        },
        yearlyBudget: {
            type: Number,
            default: 0
        },
        planningBucket: {
            type: String,
            enum: ['None', 'Long Term', 'Short Term', 'Wants', 'Needs'],
            default: 'None'
        },
    },
    { timestamps: true }
);

if (mongoose.models.Category) {
    delete mongoose.models.Category;
}
const Category = mongoose.model("Category", categorySchema);
export default Category;
