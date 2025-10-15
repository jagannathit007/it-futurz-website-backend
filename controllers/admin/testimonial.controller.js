const Testimonial = require("../../models/testimonial.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");
const ApiError = require("../../utils/apiError");

// Create Testimonial
const createTestimonial = asyncHandler(async (req, res) => {
  const { quote, name, title } = req.body;

  if (!quote || !name || !title) {
    throw new ApiError(400, "Quote, name, and title are required");
  }

  if (quote.length > 150) {
    throw new ApiError(400, "Quote cannot exceed 150 characters");
  }

  const testimonial = await Testimonial.create({
    quote,
    name,
    title,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Testimonial created successfully", testimonial));
});

// Get all testimonials with pagination and search
const getTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.body || {};

  const filter = {};
  if (search) {
    filter.$or = [
      { quote: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } }
    ];
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === true || isActive === "true";
  }

  const totalDocs = await Testimonial.countDocuments(filter);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.max(parseInt(limit, 10) || 10, 1);
  const docs = await Testimonial.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * perPage)
    .limit(perPage);

  const payload = {
    docs,
    totalDocs,
    limit: perPage,
    page: currentPage,
    totalPages: Math.max(Math.ceil(totalDocs / perPage), 1),
    hasNextPage: currentPage * perPage < totalDocs,
    hasPrevPage: currentPage > 1,
  };

  res.status(200).json(new ApiResponse(200, "Testimonials fetched", payload));
});

// Get single testimonial
const getTestimonialById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) throw new ApiError(404, "Testimonial not found");
  res.status(200).json(new ApiResponse(200, "Testimonial fetched", testimonial));
});

// Update Testimonial
const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quote, name, title, isActive } = req.body;

  const testimonial = await Testimonial.findById(id);
  if (!testimonial) throw new ApiError(404, "Testimonial not found");

  if (quote !== undefined) {
    if (quote.length > 150) {
      throw new ApiError(400, "Quote cannot exceed 150 characters");
    }
    testimonial.quote = quote;
  }
  if (name !== undefined) testimonial.name = name;
  if (title !== undefined) testimonial.title = title;
  if (isActive !== undefined)
    testimonial.isActive = isActive === true || isActive === "true";

  await testimonial.save();
  res.status(200).json(new ApiResponse(200, "Testimonial updated", testimonial));
});

// Delete Testimonial
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) throw new ApiError(404, "Testimonial not found");

  await Testimonial.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, "Testimonial deleted", { _id: id }));
});

// Toggle active status
const toggleTestimonialStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) throw new ApiError(404, "Testimonial not found");
  testimonial.isActive = !testimonial.isActive;
  await testimonial.save();
  res.status(200).json(new ApiResponse(200, "Testimonial status updated", testimonial));
});

module.exports = {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
};
