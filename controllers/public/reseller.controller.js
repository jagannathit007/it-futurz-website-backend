const Reseller = require("../../models/reseller.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Get all active services for public display
const saveReseller = asyncHandler(async (req, res) => {
    try {
        const resellerData = req.body;
        const reseller = new Reseller(resellerData);
        await reseller.save();
        res.status(200).json(
            new ApiResponse(200, "Reseller saved successfully", reseller)
        );
    } catch (error) {
        res.status(500).json(
            new ApiResponse(500, "Error saving reseller", null)
        );
    }
});

module.exports = {
    saveReseller,
};
