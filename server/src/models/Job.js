import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
