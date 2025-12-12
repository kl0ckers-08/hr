// models/hr2/admin/TrainingProgram.ts
import mongoose from "mongoose";

const trainingProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["Workshop", "Seminar", "Webinar", "Conference"], default: "Workshop" },
  description: String,
  date: { type: Date, required: true },
  time: String,
  location: String,
  facilitator: String,
  maxParticipants: { type: Number, default: 50 },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"], default: "Upcoming" },
  rating: { type: Number, min: 0, max: 5 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.TrainingProgram || mongoose.model("TrainingProgram", trainingProgramSchema);
