// routes/adminTrip.routes.js
const express = require('express');
const router = express.Router();
const adminTripController = require('../controllers/adminTrip.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy danh sách chuyến xe
router.get('/trips', authMiddleware, adminTripController.getAllTrips);

// Lấy chi tiết chuyến xe
router.get('/trips/:id', authMiddleware, adminTripController.getTripById);

// Tạo chuyến xe mới
router.post('/trips', authMiddleware, adminTripController.createTrip);

// Cập nhật chuyến xe
router.put('/trips/:id', authMiddleware, adminTripController.updateTrip);

// Xóa chuyến xe
router.delete('/trips/:id', authMiddleware, adminTripController.deleteTrip);

// Thống kê chuyến xe
router.get('/trips/stats', authMiddleware, adminTripController.getTripStats);

module.exports = router;