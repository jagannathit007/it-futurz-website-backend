const Contact = require("../../models/contact.model");
const { asyncHandler } = require("../../utils/helpers");
const { ApiResponse } = require("../../utils/response");

// Validation function
const validateContactData = (data) => {
  const errors = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else {
    const nameLength = data.name.trim().length;
    if (nameLength < 2) {
      errors.push(`Name must be at least 2 characters long. You entered ${nameLength} character(s).`);
    } else if (nameLength > 100) {
      errors.push(`Name is too long. Maximum 100 characters allowed. You entered ${nameLength} characters.`);
    }
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push('Please enter a valid email address');
    } else if (data.email.trim().length > 255) {
      errors.push('Email must be less than 255 characters');
    }
  }

  // Country code validation
  if (!data.countryCode || typeof data.countryCode !== 'string' || data.countryCode.trim().length === 0) {
    errors.push('Country code is required');
  } else if (!/^\+\d{1,4}$/.test(data.countryCode.trim())) {
    errors.push('Please enter a valid country code (e.g., +1, +91)');
  }

  // Phone validation
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else {
    // Remove all non-digit characters to check actual digit count
    const phoneDigits = data.phone.replace(/\D/g, '');
    
    if (phoneDigits.length === 0) {
      errors.push('Please enter a valid phone number');
    } else if (phoneDigits.length < 10) {
      errors.push(`Please enter at least 10 digits. You entered ${phoneDigits.length} digits.`);
    } else if (phoneDigits.length > 15) {
      errors.push(`Phone number is too long. Maximum 15 digits allowed. You entered ${phoneDigits.length} digits.`);
    } else {
      // Additional validation for common phone number patterns
      const phoneRegex = /^[0-9\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(data.phone)) {
        errors.push('Please enter a valid phone number format');
      }
    }
  }

  // Message validation
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Message is required');
  } else {
    const messageLength = data.message.trim().length;
    if (messageLength < 10) {
      errors.push(`Message must be at least 10 characters long. You entered ${messageLength} characters.`);
    } else if (messageLength > 1000) {
      errors.push(`Message is too long. Maximum 1000 characters allowed. You entered ${messageLength} characters.`);
    }
  }

  return errors;
};

// Create new contact submission (public endpoint)
const createContact = asyncHandler(async (req, res) => {
  const { name, email, countryCode, phone, message } = req.body;

  // Validate input data
  const validationErrors = validateContactData({ name, email, countryCode, phone, message });
  if (validationErrors.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, validationErrors.join(', '), null)
    );
  }

  // Clean and prepare data
  const contactData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    countryCode: countryCode.trim(),
    phone: phone.trim(),
    message: message.trim(),
  };

  const contact = await Contact.create(contactData);

  res.status(201).json(
    new ApiResponse(201, "Thank you for your message. We'll get back to you soon!", contact)
  );
});

module.exports = {
  createContact,
};
