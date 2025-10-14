const OpenPosition = require("../../models/openPosition.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Get active open positions for public site
const getPublicOpenPositions = asyncHandler(async (req, res) => {
  const { department, type, location, search } = req.query;

  const filter = { isActive: true };

  if (department) filter.department = { $regex: department, $options: "i" };
  if (type) filter.type = type;
  if (location) filter.location = { $regex: location, $options: "i" };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
  }

  const positions = await OpenPosition.find(filter)
    .select(
      "title department location type experience description requirements responsibilities benefits salary isRemote applicationDeadline tags priority createdAt"
    )
    .sort({ priority: -1, createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, "Open positions fetched", positions));
});

module.exports = { getPublicOpenPositions };


