// models/Job.ts
import mongoose, { Schema, model, models } from "mongoose";

const JobSchema = new Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    employmentType: { type: String, required: true },
    location: { type: String, required: true },
    deadline: { type: Date, required: true },
    description: { type: String },
    qualifications: { type: [String] },
    requirements: { type: [String] },
    views: { type: Number, default: 0 },
    applicants: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

// Using "Job" as the model name to match the ref in Application model
const Job = models.Job || model("jobpostings", JobSchema);
export default Job;
