// models/EvaluationResult.ts
import mongoose from "mongoose";

const EvaluationResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },

    questions: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, required: true },
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true }
        }
    ],

    answers: { type: Map, of: String },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
});

export default mongoose.models.EvaluationResult || mongoose.model("EvaluationResult", EvaluationResultSchema);

