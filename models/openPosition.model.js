const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const openPositionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [50, "Department cannot exceed 50 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Job type is required"],
      enum: {
        values: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
        message: "Job type must be one of: Full-time, Part-time, Contract, Internship, Freelance",
      },
    },
    experience: {
      type: String,
      required: [true, "Experience level is required"],
      trim: true,
      maxlength: [50, "Experience cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    requirements: {
      type: [String],
      required: [true, "Job requirements are required"],
      validate: {
        validator: function (requirements) {
          return requirements && requirements.length > 0;
        },
        message: "At least one requirement is required",
      },
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    salary: {
      min: {
        type: Number,
        min: [0, "Minimum salary cannot be negative"],
      },
      max: {
        type: Number,
        min: [0, "Maximum salary cannot be negative"],
      },
      currency: {
        type: String,
        default: "INR",
        enum: ["INR", "USD", "EUR"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    applicationDeadline: {
      type: Date,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    priority: {
      type: Number,
      default: 0,
      min: [0, "Priority cannot be negative"],
      max: [10, "Priority cannot exceed 10"],
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination plugin
openPositionSchema.plugin(mongoosePaginate);

// Index for better query performance
openPositionSchema.index({ title: 1, department: 1 });
openPositionSchema.index({ isActive: 1, createdAt: -1 });
openPositionSchema.index({ location: 1 });
openPositionSchema.index({ type: 1 });

// Virtual for formatted salary range
openPositionSchema.virtual("salaryRange").get(function () {
  if (this.salary.min && this.salary.max) {
    return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  } else if (this.salary.min) {
    return `${this.salary.currency} ${this.salary.min.toLocaleString()}+`;
  } else if (this.salary.max) {
    return `Up to ${this.salary.currency} ${this.salary.max.toLocaleString()}`;
  }
  return "Not specified";
});

// Method to check if position is still accepting applications
openPositionSchema.methods.isAcceptingApplications = function () {
  if (!this.isActive) return false;
  if (this.applicationDeadline && this.applicationDeadline < new Date()) return false;
  return true;
};

// Pre-save middleware to validate salary range
openPositionSchema.pre("save", function (next) {
  if (this.salary.min && this.salary.max && this.salary.min > this.salary.max) {
    return next(new Error("Minimum salary cannot be greater than maximum salary"));
  }
  next();
});

// Static method to get active positions
openPositionSchema.statics.getActivePositions = function () {
  return this.find({ isActive: true })
    .populate("postedBy", "name email")
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to get positions by department
openPositionSchema.statics.getPositionsByDepartment = function (department) {
  return this.find({ department: new RegExp(department, "i"), isActive: true })
    .populate("postedBy", "name email")
    .sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model("OpenPosition", openPositionSchema);
