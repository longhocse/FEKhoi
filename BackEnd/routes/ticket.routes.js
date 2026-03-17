const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const authMiddleware = require('../middleware/authMiddleware'); // SỬA: auth.middleware thay vì authMiddleware

// Lấy danh sách vé của user hiện tại
router.get('/my-tickets', authMiddleware, ticketController.getMyTickets);

// Lấy chi tiết vé theo ID
router.get('/:id', authMiddleware, ticketController.getTicketById);

// Hủy vé
router.post('/:id/cancel', authMiddleware, ticketController.cancelTicket);

// Admin: Lấy tất cả vé
router.get('/admin/all', authMiddleware, ticketController.getAllTickets);

// Admin: Cập nhật trạng thái vé
router.put('/admin/:id/status', authMiddleware, ticketController.updateTicketStatus);

module.exports = router;