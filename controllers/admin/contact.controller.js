const Contact = require("../../models/contact.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Create new contact submission (from frontend)
const createContact = asyncHandler(async (req, res) => {
  const { name, email, countryCode, phone, message } = req.body;

  const contact = await Contact.create({
    name,
    email,
    countryCode,
    phone,
    message,
  });

  res.status(201).json(
    new ApiResponse(201, "Contact form submitted successfully", contact)
  );
});

// Get all contacts (admin)
const getContacts = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.body;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
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
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const contacts = await Contact.find(query)
    .populate("respondedBy", "name email")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Contact.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Contacts retrieved successfully", {
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalContacts: total,
        limit: parseInt(limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  );
});

// Get single contact (admin)
const getContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findById(id).populate(
    "respondedBy",
    "name email"
  );

  if (!contact) {
    return res.status(404).json(
      new ApiResponse(404, "Contact not found", null)
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Contact retrieved successfully", contact)
  );
});

// Update contact status and notes (admin)
const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const adminId = req.admin.id;

  const contact = await Contact.findById(id);

  if (!contact) {
    return res.status(404).json(
      new ApiResponse(404, "Contact not found", null)
    );
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (status && status !== "new") {
    updateData.respondedBy = adminId;
    updateData.respondedAt = new Date();
  }

  const updatedContact = await Contact.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate("respondedBy", "name email");

  res.status(200).json(
    new ApiResponse(200, "Contact updated successfully", updatedContact)
  );
});

// Delete contact (admin)
const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findByIdAndDelete(id);

  if (!contact) {
    return res.status(404).json(
      new ApiResponse(404, "Contact not found", null)
    );
  }

  res.status(200).json(
    new ApiResponse(200, "Contact deleted successfully", null)
  );
});

// Get contact statistics (admin)
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalContacts = await Contact.countDocuments();
  const recentContacts = await Contact.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  const statusCounts = {};
  stats.forEach((stat) => {
    statusCounts[stat._id] = stat.count;
  });

  res.status(200).json(
    new ApiResponse(200, "Contact statistics retrieved successfully", {
      totalContacts,
      recentContacts,
      statusCounts,
    })
  );
});

module.exports = {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
};
