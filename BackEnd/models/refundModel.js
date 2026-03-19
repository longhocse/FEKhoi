const sql = require('mssql');
const { poolPromise } = require('../config/db');

const Refund = {
    // Tạo yêu cầu hoàn tiền
    create: async (refundData) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('ticketId', sql.Int, refundData.ticketId)
                .input('userId', sql.Int, refundData.userId)
                .input('amount', sql.Decimal(12, 2), refundData.amount)
                .input('reason', sql.NVarChar, refundData.reason)
                .input('status', sql.VarChar(20), 'PENDING')
                .input('refundPercentage', sql.Int, refundData.refundPercentage)
                .query(`
                    INSERT INTO Refunds (ticketId, userId, amount, reason, status, refundPercentage, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@ticketId, @userId, @amount, @reason, @status, @refundPercentage, GETDATE())
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi tạo refund:', err);
            throw err;
        }
    },

    // Lấy refund theo ID
    getById: async (id) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT r.*, 
                        u.name as userName, 
                        u.email as userEmail,
                        t.id as ticketId,
                        t.totalAmount as ticketAmount,
                        t.status as ticketStatus,
                        tr.fromStation,
                        tr.toStation,
                        tr.startTime
                    FROM Refunds r
                    JOIN Users u ON r.userId = u.id
                    JOIN Tickets t ON r.ticketId = t.id
                    JOIN Trips tr ON t.tripId = tr.id
                    WHERE r.id = @id
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi lấy refund:', err);
            throw err;
        }
    },

    // Lấy refund theo userId
    getByUserId: async (userId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT r.*, 
                        t.id as ticketId,
                        t.totalAmount as ticketAmount,
                        t.status as ticketStatus,
                        tr.fromStation,
                        tr.toStation,
                        tr.startTime,
                        DATEDIFF(HOUR, GETDATE(), tr.startTime) as hoursUntilDeparture
                    FROM Refunds r
                    JOIN Tickets t ON r.ticketId = t.id
                    JOIN Trips tr ON t.tripId = tr.id
                    WHERE r.userId = @userId
                    ORDER BY r.createdAt DESC
                `);
            return result.recordset;
        } catch (err) {
            console.error('Lỗi lấy refund theo user:', err);
            throw err;
        }
    },

    // Lấy refund theo ticketId
    getByTicketId: async (ticketId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('ticketId', sql.Int, ticketId)
                .query('SELECT * FROM Refunds WHERE ticketId = @ticketId');
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi lấy refund theo ticket:', err);
            throw err;
        }
    },

    // Lấy tất cả refund (admin)
    getAll: async (filters = {}) => {
        try {
            const pool = await poolPromise;
            let query = `
                SELECT r.*, 
                    u.name as userName, 
                    u.email as userEmail,
                    t.totalAmount as ticketAmount,
                    tr.fromStation,
                    tr.toStation,
                    tr.startTime
                FROM Refunds r
                JOIN Users u ON r.userId = u.id
                JOIN Tickets t ON r.ticketId = t.id
                JOIN Trips tr ON t.tripId = tr.id
                WHERE 1=1
            `;

            const request = pool.request();

            if (filters.status) {
                query += ' AND r.status = @status';
                request.input('status', sql.VarChar(20), filters.status);
            }

            query += ' ORDER BY r.createdAt DESC';

            if (filters.limit) {
                query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
                request.input('offset', sql.Int, filters.offset || 0);
                request.input('limit', sql.Int, filters.limit);
            }

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Lỗi lấy tất cả refund:', err);
            throw err;
        }
    },

    // Cập nhật trạng thái refund (admin)
    updateStatus: async (id, status, processedAt = new Date()) => {
        try {
            const pool = await poolPromise;

            // Lấy thông tin refund
            const refundInfo = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Refunds WHERE id = @id');

            if (refundInfo.recordset.length === 0) {
                throw new Error('Không tìm thấy yêu cầu hoàn tiền');
            }

            const refund = refundInfo.recordset[0];

            // Nếu APPROVED, cộng tiền lại vào ví
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

                // Tạo giao dịch hoàn tiền
                const walletResult = await pool.request()
                    .input('userId', sql.Int, refund.userId)
                    .query('SELECT id FROM Wallets WHERE userId = @userId');

                if (walletResult.recordset.length > 0) {
                    const walletId = walletResult.recordset[0].id;

                    await pool.request()
                        .input('walletId', sql.Int, walletId)
                        .input('amount', sql.Decimal(12, 2), refund.amount)
                        .input('type', sql.VarChar(20), 'REFUND')
                        .input('status', sql.VarChar(20), 'SUCCESS')
                        .input('description', sql.NVarChar(255), `Hoàn tiền vé #${refund.ticketId} - ${refund.reason}`)
                        .input('referenceId', sql.VarChar(100), refund.ticketId.toString())
                        .query(`
                            INSERT INTO Transactions (walletId, amount, type, status, description, referenceId, createdAt)
                            VALUES (@walletId, @amount, @type, @status, @description, @referenceId, GETDATE())
                        `);
                }

                // Cập nhật trạng thái ticket thành CANCELLED nếu chưa
                await pool.request()
                    .input('ticketId', sql.Int, refund.ticketId)
                    .input('status', sql.VarChar(20), 'CANCELLED')
                    .query(`
                        UPDATE Tickets 
                        SET status = @status 
                        WHERE id = @ticketId AND status != 'CANCELLED'
                    `);
            }

            // Cập nhật trạng thái refund
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('status', sql.VarChar(20), status)
                .input('processedAt', sql.DateTime, processedAt)
                .query(`
                    UPDATE Refunds
                    SET status = @status, processedAt = @processedAt
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);

            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi cập nhật refund:', err);
            throw err;
        }
    },

    // Tính số tiền hoàn dựa trên thời gian
    calculateRefundAmount: (ticketPrice, departureTime) => {
        const now = new Date();
        const departure = new Date(departureTime);

        // Tính số giờ còn lại đến giờ khởi hành
        const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);

        // Nếu còn trên 48 giờ (2 ngày)
        if (hoursUntilDeparture > 48) {
            return {
                amount: ticketPrice,
                percentage: 100,
                message: 'Hoàn 100% số tiền vé (hủy trước 48 giờ)'
            };
        }
        // Nếu còn từ 0 đến 48 giờ
        else if (hoursUntilDeparture > 0) {
            return {
                amount: ticketPrice * 0.5,
                percentage: 50,
                message: 'Hoàn 50% số tiền vé (hủy sau 48 giờ)'
            };
        }
        // Nếu đã quá giờ khởi hành
        else {
            return {
                amount: 0,
                percentage: 0,
                message: 'Không được hoàn tiền (đã quá giờ khởi hành)'
            };
        }
    },

    // Kiểm tra xem có thể hoàn tiền không
    canRefund: (departureTime) => {
        const now = new Date();
        const departure = new Date(departureTime);
        const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);

        return hoursUntilDeparture > 0; // Có thể hoàn nếu chưa quá giờ
    }
};

module.exports = Refund;