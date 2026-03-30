const sql = require('mssql');
const { poolPromise } = require('../config/db');

const CompanyReview = {
    // Tạo đánh giá nhà xe
    create: async (data) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Int, data.userId)
                .input('companyId', sql.Int, data.companyId)
                .input('rating', sql.Int, data.rating)
                .input('comment', sql.NVarChar, data.comment || null)
                .input('images', sql.NVarChar, data.images || null)
                .query(`
                    INSERT INTO CompanyReviews (userId, companyId, rating, comment, images, status, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@userId, @companyId, @rating, @comment, @images, 'PENDING', GETDATE())
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi tạo đánh giá:', err);
            throw err;
        }
    },

    // Lấy đánh giá theo nhà xe
    getByCompanyId: async (companyId, limit = 20) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('companyId', sql.Int, companyId)
                .input('limit', sql.Int, limit)
                .query(`
                    SELECT TOP (@limit) 
                        r.*,
                        u.name as userName,
                        u.avatar as userAvatar,
                        u.email as userEmail
                    FROM CompanyReviews r
                    JOIN Users u ON r.userId = u.id
                    WHERE r.companyId = @companyId AND r.status = 'APPROVED'
                    ORDER BY r.createdAt DESC
                `);
            return result.recordset;
        } catch (err) {
            console.error('Lỗi lấy đánh giá:', err);
            throw err;
        }
    },

    // Lấy tất cả đánh giá (admin)
    getAll: async (filters = {}) => {
        try {
            const pool = await poolPromise;
            let query = `
                SELECT r.*, 
                    u.name as userName,
                    u.email as userEmail,
                    c.name as companyName,
                    c.logo as companyLogo
                FROM CompanyReviews r
                JOIN Users u ON r.userId = u.id
                JOIN PassengerCarCompanies c ON r.companyId = c.id
                WHERE 1=1
            `;

            if (filters.status && filters.status !== 'ALL') {
                query += ` AND r.status = '${filters.status}'`;
            }

            query += ` ORDER BY r.createdAt DESC`;

            const result = await pool.request().query(query);
            return result.recordset;
        } catch (err) {
            console.error('Lỗi lấy tất cả đánh giá:', err);
            throw err;
        }
    },

    // Lấy thống kê rating
    getStats: async (companyId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('companyId', sql.Int, companyId)
                .query(`
                    SELECT 
                        AVG(rating) as averageRating,
                        COUNT(*) as totalReviews,
                        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating5,
                        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating4,
                        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating3,
                        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating2,
                        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating1
                    FROM CompanyReviews
                    WHERE companyId = @companyId AND status = 'APPROVED'
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi lấy thống kê:', err);
            throw err;
        }
    },

    // Cập nhật trạng thái (admin)
    updateStatus: async (id, status, adminNote) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('status', sql.VarChar(20), status)
                .input('adminNote', sql.NVarChar, adminNote || null)
                .query(`
                    UPDATE CompanyReviews
                    SET status = @status, adminNote = @adminNote, updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);
            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái:', err);
            throw err;
        }
    }
};

module.exports = CompanyReview;