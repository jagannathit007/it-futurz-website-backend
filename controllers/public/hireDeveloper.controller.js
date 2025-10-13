const HireDeveloper = require("../../models/hireDeveloper.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Create new hire developer request (public endpoint)
const createHireDeveloperRequest = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    phone, 
    company, 
    technology, 
    budgetMin, 
    budgetMax, 
    timeline, 
    developersNeeded, 
    engagementType 
  } = req.body;

  // Validate budget range
  if (budgetMax <= budgetMin) {
    return res.status(400).json(
      new ApiResponse(400, "Maximum budget must be greater than minimum budget", null)
    );
  }

  const hireDeveloperRequest = await HireDeveloper.create({
    name,
    email,
    phone,
    company,
    technology,
    budgetMin,
    budgetMax,
    timeline,
    developersNeeded,
    engagementType,
  });

  res.status(201).json(
    new ApiResponse(201, "Thank you for your hire request. We'll review it and get back to you soon!", hireDeveloperRequest)
  );
});

module.exports = {
  createHireDeveloperRequest,
};
