// BackEnd/models/reportModel.js
const sql = require('mssql');
const { poolPromise } = require('../config/db');

const Report = {
    // Lấy tất cả báo cáo
    getAll: async (filters = {}) => {
        try {
            const pool = await poolPromise;
            let query = `
                SELECT 
                    r.*, 
                    u.name as userName,
                    u.email as userEmail,
                    u.phoneNumber as userPhone
                FROM Reports r
                LEFT JOIN Users u ON r.userId = u.id
                WHERE 1=1
            `;

            if (filters.status && filters.status !== 'ALL') {
                query += ` AND r.status = '${filters.status}'`;
            }

            if (filters.category && filters.category !== 'ALL') {
                query += ` AND r.category = '${filters.category}'`;
            }

            query += ` ORDER BY r.createdAt DESC`;

            const result = await pool.request().query(query);
            return result.recordset;
        } catch (err) {
            console.error('Lỗi lấy reports:', err);
            throw err;
        }
    },

    // Cập nhật trạng thái báo cáo
    updateStatus: async (id, status, adminNote) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('status', sql.VarChar(20), status)
                .input('adminNote', sql.NVarChar, adminNote || null)
                .query(`
                    UPDATE Reports
                    SET status = @status, 
                        adminNote = @adminNote,
                        resolvedAt = CASE WHEN @status IN ('RESOLVED', 'CLOSED') THEN GETDATE() ELSE NULL END
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi cập nhật report:', err);
            throw err;
        }
    },

    // Lấy thống kê
    getStats: async () => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    COUNT(*) as totalReports,
                    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingReports,
                    SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) as processingReports,
                    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedReports,
                    SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closedReports,
                    SUM(CASE WHEN category = 'TECHNICAL' THEN 1 ELSE 0 END) as technicalReports,
                    SUM(CASE WHEN category = 'SERVICE' THEN 1 ELSE 0 END) as serviceReports,
                    SUM(CASE WHEN category = 'PAYMENT' THEN 1 ELSE 0 END) as paymentReports,
                    SUM(CASE WHEN category = 'OTHER' THEN 1 ELSE 0 END) as otherReports
                FROM Reports
                WHERE createdAt >= DATEADD(month, -1, GETDATE())
            `);
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi lấy thống kê report:', err);
            throw err;
        }
    }
};

module.exports = Report;