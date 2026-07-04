import mongoose from "mongoose";

if (mongoose.models.TestCase) {
    delete mongoose.models.TestCase;
}

const testsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

const TestCase = mongoose.models.TestCase || mongoose.model("TestCase", testsSchema);
export default TestCase;
