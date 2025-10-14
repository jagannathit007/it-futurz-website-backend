const { Router } = require("express");
const createUploadMiddleware = require("../middlewares/fileUploader.middleware");
const constants = require("../config/constants");
const { adminAuthMiddleware } = require("../middlewares/admin.middleware");
const authController = require("../controllers/admin/authentication.controller");
const contactController = require("../controllers/admin/contact.controller");
const jobApplicationController = require("../controllers/admin/jobApplication.controller");
const hireDeveloperController = require("../controllers/admin/hireDeveloper.controller");
const dashboardController = require("../controllers/admin/dashboard.controller");
const openPositionController = require("../controllers/admin/openPosition.controller");
const productController = require("../controllers/admin/product.controller");
const serviceController = require("../controllers/admin/service.controller");

const router = Router();

const profileUpload = createUploadMiddleware(constants.UPLOADS.PROFILES).single('avatar');
const productImageUpload = createUploadMiddleware(constants.UPLOADS.PRODUCTS).single('image');
const serviceImageUpload = createUploadMiddleware(constants.UPLOADS.PRODUCTS).single('image');

// Authentication (POST methods)
router.post('/register', profileUpload, authController.register);
router.post('/login', authController.login);
router.post('/logout', adminAuthMiddleware, authController.logout);
router.post('/refresh-token', authController.refreshAccessToken);
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

// Hire Developer Management
router.post('/hire-developers/get', adminAuthMiddleware, hireDeveloperController.getHireDeveloperRequests);
router.post('/hire-developers/get/:id', adminAuthMiddleware, hireDeveloperController.getHireDeveloperRequest);
router.post('/hire-developers/update/:id', adminAuthMiddleware, hireDeveloperController.updateHireDeveloperRequest);
router.post('/hire-developers/delete/:id', adminAuthMiddleware, hireDeveloperController.deleteHireDeveloperRequest);
router.post('/hire-developers/stats', adminAuthMiddleware, hireDeveloperController.getHireDeveloperStats);

// Open Position Management
router.post('/open-positions/create', adminAuthMiddleware, openPositionController.createOpenPosition);
router.post('/open-positions/get', adminAuthMiddleware, openPositionController.getAllOpenPositions);
router.post('/open-positions/get/:id', adminAuthMiddleware, openPositionController.getOpenPositionById);
router.post('/open-positions/update/:id', adminAuthMiddleware, openPositionController.updateOpenPosition);
router.post('/open-positions/delete/:id', adminAuthMiddleware, openPositionController.deleteOpenPosition);
router.post('/open-positions/toggle-status/:id', adminAuthMiddleware, openPositionController.togglePositionStatus);
router.post('/open-positions/stats', adminAuthMiddleware, openPositionController.getPositionStats);

// Products Management
router.post('/products/create', adminAuthMiddleware, productImageUpload, productController.createProduct);
router.post('/products/get', adminAuthMiddleware, productController.getProducts);
router.post('/products/get/:id', adminAuthMiddleware, productController.getProductById);
router.post('/products/update/:id', adminAuthMiddleware, productImageUpload, productController.updateProduct);
router.post('/products/delete/:id', adminAuthMiddleware, productController.deleteProduct);
router.post('/products/toggle-status/:id', adminAuthMiddleware, productController.toggleProductStatus);

// Services Management
router.post('/services/create', adminAuthMiddleware, serviceImageUpload, serviceController.createService);
router.post('/services/get', adminAuthMiddleware, serviceController.getServices);
router.post('/services/get/:id', adminAuthMiddleware, serviceController.getServiceById);
router.post('/services/update/:id', adminAuthMiddleware, serviceImageUpload, serviceController.updateService);
router.post('/services/delete/:id', adminAuthMiddleware, serviceController.deleteService);
router.post('/services/toggle-status/:id', adminAuthMiddleware, serviceController.toggleServiceStatus);

// Dashboard Statistics (Combined)
router.post('/dashboard/stats', adminAuthMiddleware, dashboardController.getDashboardStats);

module.exports = router;