const express = require('express');
const router = express.Router();

// Import controller
const walletController = require('../controllers/wallet.controller');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// ===== USER ROUTES =====
// Lấy thông tin ví của tôi
router.get('/me', authMiddleware, walletController.getMyWallet);

// Nạp tiền vào ví
router.post('/topup', authMiddleware, walletController.topUp);

// Thanh toán bằng ví
router.post('/pay', authMiddleware, walletController.pay);

// Rút tiền từ ví
router.post('/withdraw', authMiddleware, walletController.withdraw);

// Lấy lịch sử giao dịch
router.get('/transactions', authMiddleware, walletController.getTransactionHistory);

// Lấy chi tiết giao dịch
router.get('/transactions/:transactionId', authMiddleware, walletController.getTransactionDetail);

// ===== ADMIN ROUTES =====
// Lấy tất cả ví (admin)
router.get('/admin/all', authMiddleware, walletController.getAllWallets);

// Khóa/mở khóa ví (admin)
router.put('/admin/:walletId/toggle-lock', authMiddleware, walletController.toggleWalletLock);

module.exports = router;