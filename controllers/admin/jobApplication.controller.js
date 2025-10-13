const JobApplication = require("../../models/jobApplication.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");
const path = require("path");
const fs = require("fs");

// Create new job application (from frontend)
const createJobApplication = asyncHandler(async (req, res) => {
  const { name, email, phone, jobTitle, experience, coverLetter } = req.body;

  let resumeData = null;
  if (req.file) {
    resumeData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };
  }

  const jobApplication = await JobApplication.create({
    name,
    email,
    phone,
    jobTitle,
    experience,
    coverLetter,
    resume: resumeData,
  });

  res.status(201).json(
    new ApiResponse(201, "Job application submitted successfully", jobApplication)
  );
});

// Get all job applications (admin)
const getJobApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, jobTitle, search } = req.body;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (jobTitle) {
    query.jobTitle = { $regex: jobTitle, $options: "i" };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { experience: { $regex: search, $options: "i" } },
      { coverLetter: { $regex: search, $options: "i" } },
    ];
  }

  const jobApplications = await JobApplication.find(query)
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await JobApplication.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Job applications retrieved successfully", {
      jobApplications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalApplications: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  );
});

// Get single job application (admin)
const getJobApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const jobApplication = await JobApplication.findById(id).populate(
    "reviewedBy",
    "name email"
  );

  if (!jobApplication) {
    return res.status(404).json(
      new ApiResponse(404, "Job application not found", null)
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Job application retrieved successfully", jobApplication)
  );
});

// Update job application status and notes (admin)
const updateJobApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const adminId = req.admin.id;

  const jobApplication = await JobApplication.findById(id);

  if (!jobApplication) {
    return res.status(404).json(
      new ApiResponse(404, "Job application not found", null)
    );
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (status && status !== "new") {
    updateData.reviewedBy = adminId;
    updateData.reviewedAt = new Date();
  }

  const updatedJobApplication = await JobApplication.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate("reviewedBy", "name email");

  res.status(200).json(
    new ApiResponse(200, "Job application updated successfully", updatedJobApplication)
  );
});

// Delete job application (admin)
const deleteJobApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const jobApplication = await JobApplication.findById(id);

  if (!jobApplication) {
    return res.status(404).json(
      new ApiResponse(404, "Job application not found", null)
    );
  }

  // Delete resume file if exists
  if (jobApplication.resume && jobApplication.resume.path) {
    try {
      const filePath = path.join(__dirname, "../../", jobApplication.resume.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Error deleting resume file:", error);
    }
  }

  await JobApplication.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, "Job application deleted successfully", null)
  );
});

// Download resume (admin)
const downloadResume = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const jobApplication = await JobApplication.findById(id);

  if (!jobApplication || !jobApplication.resume) {
    return res.status(404).json(
      new ApiResponse(404, "Resume not found", null)
    );
  }

  const filePath = path.join(__dirname, "../../", jobApplication.resume.path);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json(
      new ApiResponse(404, "Resume file not found", null)
    );
  }

  res.download(filePath, jobApplication.resume.originalName);
});

// Get job application statistics (admin)
const getJobApplicationStats = asyncHandler(async (req, res) => {
  const stats = await JobApplication.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const jobTitleStats = await JobApplication.aggregate([
    {
      $group: {
        _id: "$jobTitle",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const totalApplications = await JobApplication.countDocuments();
  const recentApplications = await JobApplication.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  const statusCounts = {};
  stats.forEach((stat) => {
    statusCounts[stat._id] = stat.count;
  });

  res.status(200).json(
    new ApiResponse(200, "Job application statistics retrieved successfully", {
      totalApplications,
      recentApplications,
      statusCounts,
      jobTitleStats,
    })
  );
});

module.exports = {
  createJobApplication,
  getJobApplications,
  getJobApplication,
  updateJobApplication,
  deleteJobApplication,
  downloadResume,
  getJobApplicationStats,
};
