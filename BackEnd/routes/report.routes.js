const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/authMiddleware');

// User routes
router.post('/create', authMiddleware, reportController.createReport);

// Admin routes
router.get('/admin/all', authMiddleware, reportController.getAllReports);
router.put('/admin/:id/status', authMiddleware, reportController.updateReportStatus);
router.get('/admin/stats', authMiddleware, reportController.getReportStats);

module.exports = router;