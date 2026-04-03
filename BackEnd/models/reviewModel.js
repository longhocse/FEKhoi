const sql = require('mssql');
const { poolPromise } = require('../config/db');

const Review = {
    // Đánh giá chuyến xe
    createTripReview: async (data) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Int, data.userId)
                .input('tripId', sql.Int, data.tripId)
                .input('rating', sql.Int, data.rating)
                .input('comment', sql.NVarChar, data.comment || null)
                .input('images', sql.NVarChar, data.images || null)
                .query(`
                    INSERT INTO TripReviews (userId, tripId, rating, comment, images, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@userId, @tripId, @rating, @comment, @images, GETDATE())
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Lấy đánh giá theo chuyến xe
    getTripReviews: async (tripId, limit = 10) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('tripId', sql.Int, tripId)
                .input('limit', sql.Int, limit)
                .query(`
                    SELECT TOP (@limit) 
                        r.*,
                        u.name as userName,
                        u.avatar as userAvatar
                    FROM TripReviews r
                    JOIN Users u ON r.userId = u.id
                    WHERE r.tripId = @tripId AND r.status = 'APPROVED'
                    ORDER BY r.createdAt DESC
                `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Đánh giá nhà xe
    createCompanyReview: async (data) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Int, data.userId)
                .input('companyId', sql.Int, data.companyId)
                .input('rating', sql.Int, data.rating)
                .input('comment', sql.NVarChar, data.comment || null)
                .input('images', sql.NVarChar, data.images || null)
                .query(`
                    INSERT INTO CompanyReviews (userId, companyId, rating, comment, images, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@userId, @companyId, @rating, @comment, @images, GETDATE())
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Lấy đánh giá theo nhà xe
    getCompanyReviews: async (companyId, limit = 10) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('companyId', sql.Int, companyId)
                .input('limit', sql.Int, limit)
                .query(`
                    SELECT TOP (@limit) 
                        r.*,
                        u.name as userName,
                        u.avatar as userAvatar
                    FROM CompanyReviews r
                    JOIN Users u ON r.userId = u.id
                    WHERE r.companyId = @companyId AND r.status = 'APPROVED'
                    ORDER BY r.createdAt DESC
                `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Tính rating trung bình
    getAverageRating: async (type, id) => {
        try {
            const pool = await poolPromise;
            let query = '';
            if (type === 'trip') {
                query = `
                    SELECT 
                        AVG(rating) as averageRating,
                        COUNT(*) as totalReviews
                    FROM TripReviews 
                    WHERE tripId = @id AND status = 'APPROVED'
                `;
            } else {
                query = `
                    SELECT 
                        AVG(rating) as averageRating,
                        COUNT(*) as totalReviews
                    FROM CompanyReviews 
                    WHERE companyId = @id AND status = 'APPROVED'
                `;
            }
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(query);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Review;