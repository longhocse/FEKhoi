const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Đánh giá chuyến xe
router.post('/trip', authMiddleware, reviewController.createTripReview);
router.get('/trip/:tripId', reviewController.getTripReviews);

// Đánh giá nhà xe
router.post('/company', authMiddleware, reviewController.createCompanyReview);
router.get('/company/:companyId', reviewController.getCompanyReviews);

module.exports = router;