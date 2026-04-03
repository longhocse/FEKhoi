const express = require('express');
const router = express.Router();
const companyReviewController = require('../controllers/companyReview.controller');
const authMiddleware = require('../middleware/authMiddleware');

// User routes
router.post('/create', authMiddleware, companyReviewController.createReview);
router.get('/company/:companyId', companyReviewController.getReviewsByCompany);

// Admin routes
router.get('/admin/all', authMiddleware, companyReviewController.getAllReviews);
router.put('/admin/:id/status', authMiddleware, companyReviewController.updateReviewStatus);
router.get('/company/:companyId', companyReviewController.getReviewsByCompany);

module.exports = router;