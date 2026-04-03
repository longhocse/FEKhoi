const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refund.controller');
const authMiddleware = require('../middleware/authMiddleware');
console.log("refundController:", refundController);

// ===== PARTNER ROUTES =====
router.get('/partner', authMiddleware, refundController.getRefundsByPartner);
router.put('/partner/:id/process', authMiddleware, refundController.approveRefundByPartner);

// Admin routes
router.get('/admin/all', authMiddleware, refundController.getAllRefunds);
router.put('/admin/:id/process', authMiddleware, refundController.processRefund);

// User routes
router.post('/request', authMiddleware, refundController.requestRefund);
router.get('/my-refunds', authMiddleware, refundController.getMyRefunds);
router.get('/:id', authMiddleware, refundController.getRefundDetail);

module.exports = router;