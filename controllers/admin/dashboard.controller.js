const Contact = require("../../models/contact.model");
const JobApplication = require("../../models/jobApplication.model");
const HireDeveloper = require("../../models/hireDeveloper.model");
const OpenPosition = require("../../models/openPosition.model");
const Product = require("../../models/product.model");
const Service = require("../../models/service.model");
const Testimonial = require("../../models/testimonial.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Get all dashboard statistics in one API call
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get all stats in parallel
  const [
    contactStats,
    jobApplicationStats,
    hireDeveloperStats,
    openPositionStats,
    productStats,
    serviceStats,
    testimonialStats
  ] = await Promise.all([
    getContactStats(),
    getJobApplicationStats(),
    getHireDeveloperStats(),
    getOpenPositionStats(),
    getProductStats(),
    getServiceStats(),
    getTestimonialStats()
  ]);

  res.status(200).json(
    new ApiResponse(200, "Dashboard statistics retrieved successfully", {
      contactStats,
      jobApplicationStats,
      hireDeveloperStats,
      openPositionStats,
      productStats,
      serviceStats,
      testimonialStats
    })
  );
});

// Helper function to get contact statistics
async function getContactStats() {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        resolvedPercentage: {
          $cond: [
            { $gt: [{ $add: ["$resolved", "$closed"] }, 0] },
            {
              $multiply: [
                { $divide: ["$resolved", { $add: ["$resolved", "$closed"] }] },
                100
              ]
            },
            0
          ]
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    resolvedPercentage: 0
  };
}

// Helper function to get job application statistics
async function getJobApplicationStats() {
  const stats = await JobApplication.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        reviewed: { $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] } },
        shortlisted: { $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        hired: { $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        hiredPercentage: {
          $cond: [
            { $gt: [{ $add: ["$hired", "$rejected"] }, 0] },
            {
              $multiply: [
                { $divide: ["$hired", { $add: ["$hired", "$rejected"] }] },
                100
              ]
            },
            0
          ]
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    new: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    hiredPercentage: 0
  };
}

// Helper function to get hire developer statistics
async function getHireDeveloperStats() {
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

  return stats[0] || {
    total: 0,
    new: 0,
    reviewed: 0,
    quoted: 0,
    negotiating: 0,
    accepted: 0,
    rejected: 0,
    acceptanceRate: 0
  };
}

// Helper function to get open position statistics
async function getOpenPositionStats() {
  const stats = await OpenPosition.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
        remote: { $sum: { $cond: [{ $eq: ["$isRemote", true] }, 1, 0] } },
        onSite: { $sum: { $cond: [{ $eq: ["$isRemote", false] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    remote: 0,
    onSite: 0
  };
}

// Helper function to get product statistics
async function getProductStats() {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    active: 0,
    inactive: 0
  };
}

// Helper function to get service statistics
async function getServiceStats() {
  const stats = await Service.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    active: 0,
    inactive: 0
  };
}

// Helper function to get testimonial statistics
async function getTestimonialStats() {
  const stats = await Testimonial.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    active: 0,
    inactive: 0
  };
}

module.exports = {
  getDashboardStats
};
