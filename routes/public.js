const { Router } = require("express");
const createUploadMiddleware = require("../middlewares/fileUploader.middleware");
const constants = require("../config/constants");
const contactController = require("../controllers/public/contact.controller");
const jobApplicationController = require("../controllers/public/jobApplication.controller");
const hireDeveloperController = require("../controllers/public/hireDeveloper.controller");
const openPositionPublicController = require("../controllers/public/openPosition.controller");
const productPublicController = require("../controllers/public/product.controller");
const servicePublicController = require("../controllers/public/service.controller");

const router = Router();

const resumeUpload = createUploadMiddleware(constants.UPLOADS.RESUMES).single('resume');

// Public contact form submission
router.post('/contact', contactController.createContact);

// Public open positions
router.get('/open-positions', openPositionPublicController.getPublicOpenPositions);

// Public job application submission
router.post('/job-application', resumeUpload, jobApplicationController.createJobApplication);

// Public hire developer request submission
router.post('/hire-developer', hireDeveloperController.createHireDeveloperRequest);

// Public products
router.get('/products', productPublicController.getPublicProducts);

// Public services
router.get('/services', servicePublicController.getPublicServices);

module.exports = router;
