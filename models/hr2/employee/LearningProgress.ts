// models/hr2/employee/LearningProgress.ts
import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  status: { type: String, enum: ["Not Started", "In Progress", "Completed"], default: "Not Started" },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  quizScore: { type: Number, min: 0, max: 100 },
  completedTopics: [{ type: String }],
  startedAt: Date,
  completedAt: Date,
}, { timestamps: true });

// Compound index to ensure one progress record per employee per module
learningProgressSchema.index({ employee: 1, module: 1 }, { unique: true });

export default mongoose.models.LearningProgress || mongoose.model("LearningProgress", learningProgressSchema);
