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
        planningBucket: {
            type: String,
            enum: ['None', 'Long Term', 'Short Term', 'Wants', 'Needs'],
            default: 'None'
        },
        isDefault: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ userId: 1, isDefault: 1 });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
