const Contact = require("../../models/contact.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Create new contact submission (public endpoint)
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
    new ApiResponse(201, "Thank you for your message. We'll get back to you soon!", contact)
  );
});

module.exports = {
  createContact,
};
