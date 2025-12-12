// models/Report.ts
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  title: String,
  type: String,
  department: String,
  generatedBy: String,
  fileUrl: String,
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model("Report", reportSchema);