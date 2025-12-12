// models/hr2/admin/Competency.ts
import mongoose from "mongoose";

const competencySchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    unique: true // One competency record per employee
  },
  score: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: true
  },
  evaluatedAt: { 
    type: Date,
    default: Date.now
  },
  notes: String,
  // Store detailed breakdown of scores
  detailedScores: {
    technicalSkills: { type: Number, min: 0, max: 100, default: 0 },
    communication: { type: Number, min: 0, max: 100, default: 0 },
    problemSolving: { type: Number, min: 0, max: 100, default: 0 },
    teamwork: { type: Number, min: 0, max: 100, default: 0 },
    leadership: { type: Number, min: 0, max: 100, default: 0 },
  }
}, { timestamps: true });

export default mongoose.models.Competency || 
  mongoose.model("Competency", competencySchema);