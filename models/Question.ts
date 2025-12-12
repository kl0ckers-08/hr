// models/Question.ts
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient query by jobId
QuestionSchema.index({ jobId: 1 });

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);