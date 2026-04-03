// routes/vehicle.routes.js
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Log để kiểm tra
console.log('🟢 vehicleController:', vehicleController);
console.log('🟢 getAllVehicles:', typeof vehicleController.getAllVehicles);

// Lấy tất cả xe (public)
router.get('/', vehicleController.getAllVehicles);

// Lấy chi tiết xe (public)
router.get('/:id', vehicleController.getVehicleById);

// Các route cần xác thực (admin)
router.post('/', authMiddleware, vehicleController.createVehicle);
router.put('/:id', authMiddleware, vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, vehicleController.deleteVehicle);

module.exports = router;