const fs = require("fs");
const path = require("path");
const Product = require("../../models/product.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");
const ApiError = require("../../utils/apiError");

// Create Product (image optional)
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, benefits } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const benefitsArray = Array.isArray(benefits)
    ? benefits
    : benefits
    ? String(benefits)
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b)
    : [];

  const productData = {
    title,
    description,
    benefits: benefitsArray,
  };

  // Add image data if file was uploaded
  if (req.file) {
    productData.image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };
  }

  const product = await Product.create(productData);

  res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

// Get all products with pagination and search
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.body || {};

  const filter = {};
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === true || isActive === "true";
  }

  const totalDocs = await Product.countDocuments(filter);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.max(parseInt(limit, 10) || 10, 1);
  const docs = await Product.find(filter)
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

  res.status(200).json(new ApiResponse(200, "Products fetched", payload));
});

// Get single product
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, "Product fetched", product));
});

// Helper to delete a file if exists
const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_) {}
};

// Update Product (image optional)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, benefits, isActive } = req.body;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (isActive !== undefined)
    product.isActive = isActive === true || isActive === "true";

  if (benefits !== undefined) {
    const benefitsArray = Array.isArray(benefits)
      ? benefits
      : String(benefits)
          .split(",")
          .map((b) => b.trim())
          .filter((b) => b);
    product.benefits = benefitsArray;
  }

  if (req.file) {
    // delete old file if present
    safeUnlink(product?.image?.path);
    product.image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };
  }

  await product.save();
  res.status(200).json(new ApiResponse(200, "Product updated", product));
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  safeUnlink(product?.image?.path);
  await Product.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, "Product deleted", { _id: id }));
});

// Toggle active status
const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  product.isActive = !product.isActive;
  await product.save();
  res.status(200).json(new ApiResponse(200, "Product status updated", product));
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
};


