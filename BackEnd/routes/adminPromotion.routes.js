const express = require('express');
const router = express.Router();
const adminPromotionController = require('../controllers/adminPromotion.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/promotions', authMiddleware, adminPromotionController.getAllPromotions);
router.post('/promotions', authMiddleware, adminPromotionController.createPromotion);
router.put('/promotions/:id', authMiddleware, adminPromotionController.updatePromotion);
router.delete('/promotions/:id', authMiddleware, adminPromotionController.deletePromotion);
router.post('/promotions/apply', authMiddleware, adminPromotionController.applyPromotion);

module.exports = router;