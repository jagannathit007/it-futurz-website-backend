const HireDeveloper = require("../../models/hireDeveloper.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Get all hire developer requests with pagination, search, and date filtering
const getHireDeveloperRequests = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    technology = "",
    startDate = "",
    endDate = "",
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.body;

  // Build query
  let query = {};

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Technology filter
  if (technology) {
    query.technology = { $regex: technology, $options: "i" };
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with pagination
  const hireDeveloperRequests = await HireDeveloper.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('reviewedBy', 'name email')
    .lean();

  // Get total count for pagination
  const totalCount = await HireDeveloper.countDocuments(query);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Get statistics
  const stats = await HireDeveloper.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const statusStats = {};
  stats.forEach(stat => {
    statusStats[stat._id] = stat.count;
  });

  res.status(200).json(
    new ApiResponse(200, "Hire developer requests retrieved successfully", {
      hireDeveloperRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      stats: statusStats
    })
  );
});

// Get single hire developer request
const getHireDeveloperRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hireDeveloperRequest = await HireDeveloper.findById(id)
    .populate('reviewedBy', 'name email')
    .lean();

  if (!hireDeveloperRequest) {
    return res.status(404).json(
      new ApiResponse(404, "Hire developer request not found", null)
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Hire developer request retrieved successfully", hireDeveloperRequest)
  );
});

// Update hire developer request status
const updateHireDeveloperRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, quotedAmount } = req.body;
  const adminId = req.admin._id;

  const updateData = {
    status,
    adminNotes,
    reviewedBy: adminId,
    reviewedAt: new Date()
  };

  if (quotedAmount) {
    updateData.quotedAmount = quotedAmount;
    updateData.quotedAt = new Date();
  }

  const hireDeveloperRequest = await HireDeveloper.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('reviewedBy', 'name email');

  if (!hireDeveloperRequest) {
    return res.status(404).json(
      new ApiResponse(404, "Hire developer request not found", null)
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Hire developer request updated successfully", hireDeveloperRequest)
  );
});

// Delete hire developer request
const deleteHireDeveloperRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hireDeveloperRequest = await HireDeveloper.findByIdAndDelete(id);

  if (!hireDeveloperRequest) {
    return res.status(404).json(
      new ApiResponse(404, "Hire developer request not found", null)
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Hire developer request deleted successfully", null)
  );
});

// Get hire developer statistics
const getHireDeveloperStats = asyncHandler(async (req, res) => {
  const stats = await HireDeveloper.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        reviewed: { $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] } },
        quoted: { $sum: { $cond: [{ $eq: ["$status", "quoted"] }, 1, 0] } },
        negotiating: { $sum: { $cond: [{ $eq: ["$status", "negotiating"] }, 1, 0] } },
        accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        acceptanceRate: {
          $cond: [
            { $gt: [{ $add: ["$accepted", "$rejected"] }, 0] },
            {
              $multiply: [
                { $divide: ["$accepted", { $add: ["$accepted", "$rejected"] }] },
                100
              ]
            },
            0
          ]
        }
      }
    }
  ]);

  const result = stats[0] || {
    total: 0,
    new: 0,
    reviewed: 0,
    quoted: 0,
    negotiating: 0,
    accepted: 0,
    rejected: 0,
    acceptanceRate: 0
  };

  res.status(200).json(
    new ApiResponse(200, "Hire developer statistics retrieved successfully", result)
  );
});

module.exports = {
  getHireDeveloperRequests,
  getHireDeveloperRequest,
  updateHireDeveloperRequest,
  deleteHireDeveloperRequest,
  getHireDeveloperStats
};
