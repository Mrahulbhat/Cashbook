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
                },
                yearlyAmount: {
                    type: Number,
                    default: 0
                }
            }
        ],
        notes: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

if (mongoose.models.Plan) {
    delete mongoose.models.Plan;
}
const Plan = mongoose.model("Plan", planSchema);
export default Plan;
