import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
    reps: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        trim: true
    }
});

const workoutExerciseSchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
        required: true
    },
    sets: [setSchema]
});

const workoutLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        exercises: [workoutExerciseSchema],
        notes: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

const WorkoutLog = mongoose.models.WorkoutLog || mongoose.model("WorkoutLog", workoutLogSchema);
export default WorkoutLog;
