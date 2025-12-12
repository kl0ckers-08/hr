// models/hr2/employee/AssessmentResult.ts
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  question: { type: String, required: true },
  selectedAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const assessmentResultSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: "CompetencyAssessment", required: true },
  skillName: { type: String, required: true },
  category: { type: String, required: true },
  answers: [answerSchema],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  timeTaken: { type: Number }, // seconds
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for efficient queries
assessmentResultSchema.index({ employee: 1, assessment: 1 });
assessmentResultSchema.index({ employee: 1, skillName: 1 });

export default mongoose.models.AssessmentResult || mongoose.model("AssessmentResult", assessmentResultSchema);
