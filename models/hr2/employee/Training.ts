// models/hr2/employee/Training.ts
import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["Technical", "Soft Skills", "Leadership", "Compliance"], default: "Technical" },
  status: { type: String, enum: ["Enrolled", "In Progress", "Completed", "Cancelled"], default: "Enrolled" },
  startDate: Date,
  endDate: Date,
  score: { type: Number, min: 0, max: 100 },
  certificateUrl: String,
  instructor: String,
  location: String,
  notes: String,
}, { timestamps: true });

export default mongoose.models.Training || mongoose.model("Training", trainingSchema);
