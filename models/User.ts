// ========================================
// FILE 1: models/User.ts
// ========================================
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: "employee",
    },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);