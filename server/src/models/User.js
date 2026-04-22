import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    language: { type: String, enum: ["en", "hi", "gu"], default: "en" },
    currency: { type: String, enum: ["INR", "USD"], default: "INR" },
    monthlyIncome: { type: Number, default: 0 },
    emailNotifications: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    resetToken: String,
    resetTokenExpiresAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
