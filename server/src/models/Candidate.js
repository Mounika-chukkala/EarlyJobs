import mongoose from "mongoose";
import { STAGES } from "../constants/stages.js";

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    role: { type: String, required: true, trim: true },
    experienceYears: { type: Number, default: 0, min: 0 },
    skills: [{ type: String, trim: true }],
    stage: {
      type: String,
      enum: STAGES,
      default: "Applied",
      index: true,
    },
    source: {
      type: String,
      enum: ["LinkedIn", "Referral", "Career Page", "Campus", "Other"],
      default: "Career Page",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    resumeUrl: { type: String, default: "" },
    notes: [noteSchema],
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

candidateSchema.index({ name: "text", email: "text", role: "text", skills: "text" });

export const Candidate = mongoose.model("Candidate", candidateSchema);
