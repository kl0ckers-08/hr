// models/ESSRequest.ts
import mongoose from "mongoose";

const essSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, // Certificate of Employment, Training Cert, etc.
  reason: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  processedAt: Date,
}, { timestamps: true });

export default mongoose.models.ESSRequest || mongoose.model("ESSRequest", essSchema);