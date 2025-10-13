const { Router } = require("express");
const createUploadMiddleware = require("../middlewares/fileUploader.middleware");
const constants = require("../config/constants");
const { adminAuthMiddleware } = require("../middlewares/admin.middleware");
const authController = require("../controllers/admin/authentication.controller");
const contactController = require("../controllers/admin/contact.controller");
const jobApplicationController = require("../controllers/admin/jobApplication.controller");

const router = Router();

const profileUpload = createUploadMiddleware(constants.UPLOADS.PROFILES).single('avatar');

// Authentication (POST methods)
router.post('/register', profileUpload, authController.register);
router.post('/login', authController.login);
router.post('/change-password', adminAuthMiddleware, authController.changePassword);
router.post('/update-profile', adminAuthMiddleware, profileUpload, authController.updateProfile);
router.post('/get-user', adminAuthMiddleware, authController.getUser);

// Contact Management
router.post('/contacts/get', adminAuthMiddleware, contactController.getContacts);
router.post('/contacts/get/:id', adminAuthMiddleware, contactController.getContact);
router.post('/contacts/update/:id', adminAuthMiddleware, contactController.updateContact);
router.post('/contacts/delete/:id', adminAuthMiddleware, contactController.deleteContact);
router.post('/contacts/stats', adminAuthMiddleware, contactController.getContactStats);

// Job Application Management
router.post('/job-applications/get', adminAuthMiddleware, jobApplicationController.getJobApplications);
router.post('/job-applications/get/:id', adminAuthMiddleware, jobApplicationController.getJobApplication);
router.post('/job-applications/update/:id', adminAuthMiddleware, jobApplicationController.updateJobApplication);
router.post('/job-applications/delete/:id', adminAuthMiddleware, jobApplicationController.deleteJobApplication);
router.post('/job-applications/download-resume/:id', adminAuthMiddleware, jobApplicationController.downloadResume);
router.post('/job-applications/stats', adminAuthMiddleware, jobApplicationController.getJobApplicationStats);

module.exports = router;