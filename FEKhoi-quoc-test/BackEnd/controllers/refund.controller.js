const sql = require('mssql');
const { poolPromise } = require('../config/db');

// Helper function
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
}

const refundController = {
    // Tạo yêu cầu hoàn tiền
    requestRefund: async (req, res) => {
        try {
            const { ticketId, reason } = req.body;
            const userId = req.user.id;

            console.log(`📌 requestRefund - ticketId: ${ticketId}, userId: ${userId}`);

            const pool = await poolPromise;

            // Kiểm tra ticket
            const ticketResult = await pool.request()
                .input('ticketId', sql.Int, ticketId)
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT t.*, tr.startTime, tr.fromStationId, tr.toStationId
                    FROM Tickets t
                    JOIN Trips tr ON t.tripId = tr.id
                    WHERE t.id = @ticketId AND t.userId = @userId
                `);

            if (ticketResult.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy vé hoặc vé không thuộc về bạn'
                });
            }

            const ticket = ticketResult.recordset[0];

            if (ticket.status !== 'PAID') {
                return res.status(400).json({
                    success: false,
                    message: 'Chỉ có thể yêu cầu hoàn tiền cho vé đã thanh toán'
                });
            }

            // Kiểm tra đã có yêu cầu hoàn tiền chưa
            const existingRefund = await pool.request()
                .input('ticketId', sql.Int, ticketId)
                .query('SELECT id FROM Refunds WHERE ticketId = @ticketId');

            if (existingRefund.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Vé này đã có yêu cầu hoàn tiền'
                });
            }

            // Tính số tiền hoàn
            const departureTime = new Date(ticket.startTime);
            const now = new Date();
            const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

            let refundAmount = 0;
            let refundPercentage = 0;

            if (hoursUntilDeparture > 48) {
                refundAmount = ticket.totalAmount;
                refundPercentage = 100;
            } else if (hoursUntilDeparture > 0) {
                refundAmount = ticket.totalAmount * 0.5;
                refundPercentage = 50;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể hoàn tiền vì đã quá giờ khởi hành'
                });
            }

            // Tạo yêu cầu hoàn tiền
            const result = await pool.request()
                .input('ticketId', sql.Int, ticketId)
                .input('userId', sql.Int, userId)
                .input('amount', sql.Decimal(12, 2), refundAmount)
                .input('reason', sql.NVarChar, reason)
                .input('refundPercentage', sql.Int, refundPercentage)
                .input('status', sql.VarChar(20), 'PENDING')
                .query(`
                    INSERT INTO Refunds (ticketId, userId, amount, reason, refundPercentage, status, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@ticketId, @userId, @amount, @reason, @refundPercentage, @status, GETDATE())
                `);

            // Lấy tên trạm để hiển thị
            const stationNames = await pool.request()
                .input('fromStationId', sql.Int, ticket.fromStationId)
                .input('toStationId', sql.Int, ticket.toStationId)
                .query(`
                    SELECT 
                        (SELECT name FROM Stations WHERE id = @fromStationId) as fromStation,
                        (SELECT name FROM Stations WHERE id = @toStationId) as toStation
                `);

            res.json({
                success: true,
                data: {
                    ...result.recordset[0],
                    fromStation: stationNames.recordset[0]?.fromStation || 'N/A',
                    toStation: stationNames.recordset[0]?.toStation || 'N/A'
                },
                message: `Yêu cầu hoàn tiền đã được gửi. Số tiền dự kiến: ${formatCurrency(refundAmount)} (${refundPercentage}%)`
            });

        } catch (error) {
            console.error('❌ Lỗi requestRefund:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy danh sách yêu cầu hoàn tiền của user
    getMyRefunds: async (req, res) => {
        try {
            const userId = req.user.id;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT r.*, 
                        t.totalAmount as ticketAmount,
                        sFrom.name as fromStation,
                        sTo.name as toStation,
                        tr.startTime
                    FROM Refunds r
                    JOIN Tickets t ON r.ticketId = t.id
                    JOIN Trips tr ON t.tripId = tr.id
                    LEFT JOIN Stations sFrom ON tr.fromStationId = sFrom.id
                    LEFT JOIN Stations sTo ON tr.toStationId = sTo.id
                    WHERE r.userId = @userId
                    ORDER BY r.createdAt DESC
                `);

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            console.error('❌ Lỗi getMyRefunds:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy chi tiết yêu cầu hoàn tiền
    getRefundDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const isAdmin = req.user.role === 'admin';
            const pool = await poolPromise;

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT r.*, 
                        u.name as userName,
                        u.email as userEmail,
                        t.totalAmount as ticketAmount,
                        sFrom.name as fromStation,
                        sTo.name as toStation,
                        tr.startTime
                    FROM Refunds r
                    JOIN Users u ON r.userId = u.id
                    JOIN Tickets t ON r.ticketId = t.id
                    JOIN Trips tr ON t.tripId = tr.id
                    LEFT JOIN Stations sFrom ON tr.fromStationId = sFrom.id
                    LEFT JOIN Stations sTo ON tr.toStationId = sTo.id
                    WHERE r.id = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy yêu cầu hoàn tiền'
                });
            }

            const refund = result.recordset[0];

            // Kiểm tra quyền
            if (!isAdmin && refund.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xem yêu cầu này'
                });
            }

            res.json({
                success: true,
                data: refund
            });
        } catch (error) {
            console.error('❌ Lỗi getRefundDetail:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy tất cả yêu cầu hoàn tiền (admin)
    getAllRefunds: async (req, res) => {
        try {
            console.log('📌 getAllRefunds - admin called');

            const pool = await poolPromise;
            const { status } = req.query;

            let query = `
                SELECT r.*, 
                    u.name as userName, 
                    u.email as userEmail,
                    t.totalAmount as ticketAmount,
                    sFrom.name as fromStation,
                    sTo.name as toStation,
                    tr.startTime
                FROM Refunds r
                LEFT JOIN Users u ON r.userId = u.id
                LEFT JOIN Tickets t ON r.ticketId = t.id
                LEFT JOIN Trips tr ON t.tripId = tr.id
                LEFT JOIN Stations sFrom ON tr.fromStationId = sFrom.id
                LEFT JOIN Stations sTo ON tr.toStationId = sTo.id
            `;

            if (status && status !== 'ALL') {
                query += ` WHERE r.status = '${status}'`;
            }

            query += ` ORDER BY r.createdAt DESC`;

            const result = await pool.request().query(query);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (error) {
            console.error('❌ Lỗi getAllRefunds:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xử lý yêu cầu hoàn tiền (admin)
    // Xử lý yêu cầu hoàn tiền (admin)
    processRefund: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, adminNote } = req.body;
            const pool = await poolPromise;

            // Lấy thông tin refund
            const refundInfo = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                SELECT r.*, t.seatId 
                FROM Refunds r
                JOIN Tickets t ON r.ticketId = t.id
                WHERE r.id = @id
            `);

            if (refundInfo.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy yêu cầu hoàn tiền'
                });
            }

            const refund = refundInfo.recordset[0];

            // Nếu APPROVED, cộng tiền lại vào ví và nhả ghế
            if (status === 'APPROVED') {
                // Cộng tiền vào ví user
                await pool.request()
                    .input('userId', sql.Int, refund.userId)
                    .input('amount', sql.Decimal(12, 2), refund.amount)
                    .query(`
                    UPDATE Wallets 
                    SET balance = balance + @amount, updatedAt = GETDATE()
                    WHERE userId = @userId
                `);

                // NHẢ GHẾ - Cập nhật trạng thái ghế thành AVAILABLE
                await pool.request()
                    .input('seatId', sql.Int, refund.seatId)
                    .query(`
                    UPDATE Seats 
                    SET status = 'AVAILABLE' 
                    WHERE id = @seatId
                `);

                // Cập nhật trạng thái ticket thành CANCELLED
                await pool.request()
                    .input('ticketId', sql.Int, refund.ticketId)
                    .input('status', sql.VarChar(20), 'CANCELLED')
                    .query(`
                    UPDATE Tickets 
                    SET status = @status 
                    WHERE id = @ticketId
                `);

                console.log(`✅ Đã duyệt hoàn tiền, cộng ${refund.amount} vào ví user ${refund.userId} và nhả ghế ${refund.seatId}`);
            }

            // Cập nhật trạng thái refund
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('status', sql.VarChar(20), status)
                .input('processedAt', sql.DateTime, new Date())
                .input('adminNote', sql.NVarChar, adminNote || null)
                .query(`
                UPDATE Refunds
                SET status = @status, processedAt = @processedAt, adminNote = @adminNote
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

            res.json({
                success: true,
                data: result.recordset[0],
                message: status === 'APPROVED'
                    ? 'Đã duyệt hoàn tiền, tiền đã được cộng vào ví và ghế đã được nhả'
                    : 'Đã từ chối yêu cầu'
            });

        } catch (error) {
            console.error('❌ Lỗi processRefund:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    // ================= PARTNER =================

    // Partner lấy danh sách refund của mình
    getRefundsByPartner: async (req, res) => {
        try {
            const partnerId = req.user.id;
            const status = req.query.status;
            const pool = await poolPromise;

            const request = pool.request()
                .input('partnerId', sql.Int, partnerId);

            let query = `
                SELECT r.*, 
                    t.totalAmount as ticketAmount,
                    tr.startTime
                FROM Refunds r
                JOIN Tickets t ON r.ticketId = t.id
                JOIN Trips tr ON t.tripId = tr.id
                JOIN Vehicles v ON tr.vehicleId = v.id
                WHERE v.partnerId = @partnerId
        `;

            if (status && status !== 'ALL') {
                request.input('status', sql.VarChar, status);
                query += ` AND r.status = @status`;
            }

            query += ` ORDER BY r.createdAt DESC`;

            const result = await request.query(query);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (error) {
            console.error('❌ Lỗi getRefundsByPartner:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Partner duyệt refund
    approveRefundByPartner: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const partnerId = req.user.id;

            const pool = await poolPromise;

            const result = await pool.request()
                .input('refundId', sql.Int, id)
                .input('partnerId', sql.Int, partnerId)
                .input('status', sql.VarChar(20), status)
                .query(`
                    UPDATE Refunds
                    SET status = @status,
                        processedAt = GETDATE()
                    WHERE id = @refundId
                    AND status = 'PENDING'
                    AND EXISTS (
                        SELECT 1
                        FROM Tickets t
                        JOIN Trips tr ON t.tripId = tr.id
                        JOIN Vehicles v ON tr.vehicleId = v.id
                        WHERE t.id = Refunds.ticketId
                        AND v.partnerId = @partnerId
                    )
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền hoặc refund không hợp lệ'
                });
            }

            res.json({
                success: true,
                message: 'Partner đã duyệt refund'
            });

        } catch (error) {
            console.error('❌ Lỗi approveRefundByPartner:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = refundController;