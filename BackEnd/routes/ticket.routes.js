const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Kiểm tra xem controller có tồn tại không
console.log('🎫 ticketController:', Object.keys(ticketController));

// Lấy danh sách vé của user hiện tại
router.get('/my-tickets', authMiddleware, ticketController.getMyTickets);

// Lấy chi tiết vé theo ID
router.get('/:id', authMiddleware, ticketController.getTicketById);

router.get('/verify/:id', ticketController.verifyTicket);
router.post('/checkin/:id', authMiddleware, ticketController.checkInTicket);
// Lấy danh sách vé theo nhóm
router.get(
    "/group/:groupId",
    authMiddleware,
    ticketController.getTicketsByGroupId
);

// Hủy vé
router.post('/:id/cancel', authMiddleware, ticketController.cancelTicket);

// Admin: Lấy tất cả vé
router.get('/admin/all', authMiddleware, ticketController.getAllTickets);

// Admin: Cập nhật trạng thái vé
router.put('/admin/:id/status', authMiddleware, ticketController.updateTicketStatus);

module.exports = router;