const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refund.controller');
const authMiddleware = require('../middleware/authMiddleware');

// User routes
router.post('/request', authMiddleware, refundController.requestRefund);
router.get('/my-refunds', authMiddleware, refundController.getMyRefunds);
router.get('/:id', authMiddleware, refundController.getRefundDetail);

// Admin routes
router.get('/admin/all', authMiddleware, refundController.getAllRefunds);
router.put('/admin/:id/process', authMiddleware, refundController.processRefund);

module.exports = router;