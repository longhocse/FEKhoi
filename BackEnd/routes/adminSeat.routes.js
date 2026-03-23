const express = require('express');
const router = express.Router();
const adminSeatController = require('../controllers/adminSeat.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/seats/vehicle/:vehicleId', authMiddleware, adminSeatController.getSeatsByVehicle);
router.put('/seats/:seatId/status', authMiddleware, adminSeatController.updateSeatStatus);
router.post('/seats/vehicle/:vehicleId', authMiddleware, adminSeatController.createSeatsForVehicle);
router.get('/seats/vehicle/:vehicleId/stats', authMiddleware, adminSeatController.getSeatStats);

module.exports = router;