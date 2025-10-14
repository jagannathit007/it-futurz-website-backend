const Product = require("../../models/product.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Get all active products for public display
const getPublicProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('title description benefits image createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(200, "Products retrieved successfully", products)
    );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Error retrieving products", null)
    );
  }
});

module.exports = {
  getPublicProducts,
};
