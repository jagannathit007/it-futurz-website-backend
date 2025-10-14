const Service = require("../../models/service.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Get all active services for public display
const getPublicServices = asyncHandler(async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .select('title description features image createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(200, "Services retrieved successfully", services)
    );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Error retrieving services", null)
    );
  }
});

module.exports = {
  getPublicServices,
};
