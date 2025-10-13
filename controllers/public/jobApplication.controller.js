const JobApplication = require("../../models/jobApplication.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Create new job application (public endpoint)
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
    new ApiResponse(201, "Thank you for your application. We'll review it and get back to you soon!", jobApplication)
  );
});

module.exports = {
  createJobApplication,
};
