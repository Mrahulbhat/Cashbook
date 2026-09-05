import mongoose from "mongoose";

const testsSchema = new mongoose.Schema(
    {
        testCaseId: {
            type: String,
            unique: true,
            sparse: true,
            required: true,
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            required: true
        },
        steps: {
            type: [String],
            default: []
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

testsSchema.virtual('id').get(function () {
    return this.testCaseId || this._id.toString();
});

const TestCase = mongoose.models.TestCase || mongoose.model("TestCase", testsSchema);
export default TestCase;
