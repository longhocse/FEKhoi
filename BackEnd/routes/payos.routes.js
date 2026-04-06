// BackEnd/routes/payos.routes.js
const express = require('express');
const router = express.Router();
const payosController = require('../controllers/payos.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-payment', authMiddleware, payosController.createPayment);
router.post('/webhook', payosController.payosWebhook);
router.get('/status/:orderId', authMiddleware, payosController.checkPaymentStatus);
router.get("/deposit-history", authMiddleware, payosController.getDepositHistory);

module.exports = router;