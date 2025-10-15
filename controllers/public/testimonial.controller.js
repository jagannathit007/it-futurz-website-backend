const Testimonial = require("../../models/testimonial.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Get all active testimonials for public display
const getPublicTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select('quote name title createdAt');

  res.status(200).json(new ApiResponse(200, "Testimonials fetched successfully", testimonials));
});

module.exports = {
  getPublicTestimonials,
};
