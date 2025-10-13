const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    resume: {
      filename: {
        type: String,
        required: false,
      },
      originalName: {
        type: String,
        required: false,
      },
      path: {
        type: String,
        required: false,
      },
      size: {
        type: Number,
        required: false,
      },
      mimetype: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "interviewed", "rejected", "hired"],
      default: "new",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
