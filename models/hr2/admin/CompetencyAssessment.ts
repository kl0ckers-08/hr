// models/hr2/admin/CompetencyAssessment.ts
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const competencyAssessmentSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Technical Skills", "Soft Skills", "Leadership", "Domain Knowledge"], 
    required: true 
  },
  description: String,
  questions: [questionSchema],
  passingScore: { type: Number, default: 70 },
  duration: { type: Number, default: 30 }, // minutes
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Ensure unique skill assessments
competencyAssessmentSchema.index({ skillName: 1 }, { unique: true });

export default mongoose.models.CompetencyAssessment || mongoose.model("CompetencyAssessment", competencyAssessmentSchema);
