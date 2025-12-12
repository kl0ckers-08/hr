// models/hr2/employee/EmployeeCompetency.ts
import mongoose from "mongoose";

const employeeCompetencySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillName: { type: String, required: true },
  category: { type: String, enum: ["Technical Skills", "Soft Skills", "Leadership", "Domain Knowledge"], required: true },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
  score: { type: Number, min: 0, max: 100 },
  assessedAt: Date,
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: String,
  targetLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
}, { timestamps: true });

// Compound index to ensure one competency record per employee per skill
employeeCompetencySchema.index({ employee: 1, skillName: 1 }, { unique: true });

export default mongoose.models.EmployeeCompetency || mongoose.model("EmployeeCompetency", employeeCompetencySchema);
