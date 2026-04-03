const express = require('express');
const router = express.Router();
const adminRouteController = require('../controllers/adminRoute.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/routes', authMiddleware, adminRouteController.getAllRoutes);
router.post('/routes', authMiddleware, adminRouteController.createRoute);
router.put('/routes/:id', authMiddleware, adminRouteController.updateRoute);
router.delete('/routes/:id', authMiddleware, adminRouteController.deleteRoute);

module.exports = router;