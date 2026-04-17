import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        targets: [
            {
                bucket: {
                    type: String,
                    required: true,
                    enum: ['Long Term', 'Short Term', 'Wants', 'Needs']
                },
                amount: {
                    type: Number,
                    required: true,
                    default: 0
                }
            }
        ]
    },
    { timestamps: true }
);

const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);
export default Plan;
