const OpenPosition = require("../../models/openPosition.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");
const { ApiError } = require("../../utils/apiError");

// Create new open position
const createOpenPosition = asyncHandler(async (req, res) => {
  const {
    title,
    department,
    location,
    type,
    experience,
    description,
    requirements,
    responsibilities,
    benefits,
    salary,
    isRemote,
    applicationDeadline,
    tags,
    priority,
  } = req.body;

  // Validate required fields
  if (!title || !department || !location || !type || !experience || !description || !requirements) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Validate requirements array
  if (!Array.isArray(requirements) || requirements.length === 0) {
    throw new ApiError(400, "At least one requirement must be provided");
  }

  // Parse salary if provided
  let salaryData = null;
  if (salary) {
    try {
      salaryData = typeof salary === "string" ? JSON.parse(salary) : salary;
    } catch (error) {
      throw new ApiError(400, "Invalid salary format");
    }
  }

  // Parse arrays if they are strings
  const responsibilitiesArray = Array.isArray(responsibilities) 
    ? responsibilities 
    : responsibilities ? responsibilities.split(',').map(item => item.trim()) : [];
  
  const benefitsArray = Array.isArray(benefits) 
    ? benefits 
    : benefits ? benefits.split(',').map(item => item.trim()) : [];
  
  const tagsArray = Array.isArray(tags) 
    ? tags 
    : tags ? tags.split(',').map(item => item.trim()) : [];

  const openPosition = await OpenPosition.create({
    title,
    department,
    location,
    type,
    experience,
    description,
    requirements,
    responsibilities: responsibilitiesArray,
    benefits: benefitsArray,
    salary: salaryData,
    isRemote: isRemote === "true" || isRemote === true,
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
    postedBy: req.admin._id,
    tags: tagsArray,
    priority: priority ? parseInt(priority) : 0,
  });

  const populatedPosition = await OpenPosition.findById(openPosition._id)
    .populate("postedBy", "name email");

  res.status(201).json(
    new ApiResponse(201, "Open position created successfully", populatedPosition)
  );
});

// Get all open positions with pagination and filtering
const getAllOpenPositions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    type,
    location,
    isActive,
  } = req.body;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
  }
  
  if (department) {
    filter.department = { $regex: department, $options: "i" };
  }
  
  if (type) {
    filter.type = type;
  }
  
  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }
  
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }, // Default sort by creation date, newest first
    populate: { path: "postedBy", select: "name email" },
  };

  const positions = await OpenPosition.paginate(filter, options);

  res.status(200).json(
    new ApiResponse(200, "Open positions retrieved successfully", positions)
  );
});

// Get single open position by ID
const getOpenPositionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const position = await OpenPosition.findById(id)
    .populate("postedBy", "name email");

  if (!position) {
    throw new ApiError(404, "Open position not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Open position retrieved successfully", position)
  );
});

// Update open position
const updateOpenPosition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Find the position
  const position = await OpenPosition.findById(id);
  if (!position) {
    throw new ApiError(404, "Open position not found");
  }

  // Parse salary if provided
  if (updateData.salary) {
    try {
      updateData.salary = typeof updateData.salary === "string" 
        ? JSON.parse(updateData.salary) 
        : updateData.salary;
    } catch (error) {
      throw new ApiError(400, "Invalid salary format");
    }
  }

  // Parse arrays if they are strings
  if (updateData.responsibilities && typeof updateData.responsibilities === "string") {
    updateData.responsibilities = updateData.responsibilities.split(',').map(item => item.trim());
  }
  
  if (updateData.benefits && typeof updateData.benefits === "string") {
    updateData.benefits = updateData.benefits.split(',').map(item => item.trim());
  }
  
  if (updateData.tags && typeof updateData.tags === "string") {
    updateData.tags = updateData.tags.split(',').map(item => item.trim());
  }

  // Convert boolean strings to boolean
  if (updateData.isRemote !== undefined) {
    updateData.isRemote = updateData.isRemote === "true" || updateData.isRemote === true;
  }
  
  if (updateData.isActive !== undefined) {
    updateData.isActive = updateData.isActive === "true" || updateData.isActive === true;
  }

  // Convert priority to number
  if (updateData.priority !== undefined) {
    updateData.priority = parseInt(updateData.priority);
  }

  // Convert application deadline to date
  if (updateData.applicationDeadline) {
    updateData.applicationDeadline = new Date(updateData.applicationDeadline);
  }

  const updatedPosition = await OpenPosition.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("postedBy", "name email");

  res.status(200).json(
    new ApiResponse(200, "Open position updated successfully", updatedPosition)
  );
});

// Delete open position
const deleteOpenPosition = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const position = await OpenPosition.findById(id);
  if (!position) {
    throw new ApiError(404, "Open position not found");
  }

  await OpenPosition.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, "Open position deleted successfully")
  );
});

// Toggle position active status
const togglePositionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const position = await OpenPosition.findById(id);
  if (!position) {
    throw new ApiError(404, "Open position not found");
  }

  position.isActive = !position.isActive;
  await position.save();

  const updatedPosition = await OpenPosition.findById(id)
    .populate("postedBy", "name email");

  res.status(200).json(
    new ApiResponse(200, `Position ${position.isActive ? 'activated' : 'deactivated'} successfully`, updatedPosition)
  );
});

// Get position statistics
const getPositionStats = asyncHandler(async (req, res) => {
  const stats = await OpenPosition.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0]
          }
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ["$isActive", false] }, 1, 0]
          }
        },
        byDepartment: {
          $push: "$department"
        },
        byType: {
          $push: "$type"
        }
      }
    }
  ]);

  const departmentStats = await OpenPosition.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const typeStats = await OpenPosition.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const result = {
    overview: stats[0] || { total: 0, active: 0, inactive: 0 },
    byDepartment: departmentStats,
    byType: typeStats,
  };

  res.status(200).json(
    new ApiResponse(200, "Position statistics retrieved successfully", result)
  );
});


module.exports = {
  createOpenPosition,
  getAllOpenPositions,
  getOpenPositionById,
  updateOpenPosition,
  deleteOpenPosition,
  togglePositionStatus,
  getPositionStats,
};
