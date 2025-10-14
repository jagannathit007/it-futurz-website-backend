const fs = require("fs");
const path = require("path");
const Service = require("../../models/service.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");
const ApiError = require("../../utils/apiError");

// Create Service (image optional)
const createService = asyncHandler(async (req, res) => {
  const { title, description, features } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const featuresArray = Array.isArray(features)
    ? features
    : features
    ? String(features)
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f)
    : [];

  const serviceData = {
    title,
    description,
    features: featuresArray,
  };

  // Add image data if file was uploaded
  if (req.file) {
    serviceData.image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };
  }

  const service = await Service.create(serviceData);

  res
    .status(201)
    .json(new ApiResponse(201, "Service created successfully", service));
});

// Get all services with pagination and search
const getServices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.body || {};

  const filter = {};
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === true || isActive === "true";
  }

  const totalDocs = await Service.countDocuments(filter);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.max(parseInt(limit, 10) || 10, 1);
  const docs = await Service.find(filter)
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

  res.status(200).json(new ApiResponse(200, "Services fetched", payload));
});

// Get single service
const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findById(id);
  if (!service) throw new ApiError(404, "Service not found");
  res.status(200).json(new ApiResponse(200, "Service fetched", service));
});

// Helper to delete a file if exists
const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_) {}
};

// Update Service (image optional)
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, features, isActive } = req.body;

  const service = await Service.findById(id);
  if (!service) throw new ApiError(404, "Service not found");

  if (title !== undefined) service.title = title;
  if (description !== undefined) service.description = description;
  if (isActive !== undefined)
    service.isActive = isActive === true || isActive === "true";

  if (features !== undefined) {
    const featuresArray = Array.isArray(features)
      ? features
      : String(features)
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f);
    service.features = featuresArray;
  }

  if (req.file) {
    // delete old file if present
    safeUnlink(service?.image?.path);
    service.image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };
  }

  await service.save();
  res.status(200).json(new ApiResponse(200, "Service updated", service));
});

// Delete Service
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findById(id);
  if (!service) throw new ApiError(404, "Service not found");

  safeUnlink(service?.image?.path);
  await Service.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, "Service deleted", { _id: id }));
});

// Toggle active status
const toggleServiceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findById(id);
  if (!service) throw new ApiError(404, "Service not found");
  service.isActive = !service.isActive;
  await service.save();
  res.status(200).json(new ApiResponse(200, "Service status updated", service));
});

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
};
