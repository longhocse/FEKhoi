const sql = require('mssql');
const { poolPromise } = require('../config/db');
const CompanyReview = require('../models/companyReviewModel');

const companyReviewController = {
    // Tạo đánh giá nhà xe
    // Kiểm tra hàm createReview
    createReview: async (req, res) => {
        try {
            const { companyId, rating, comment } = req.body;
            const userId = req.user.id;

            console.log('📌 createReview - userId:', userId, 'companyId:', companyId, 'rating:', rating);

            // Kiểm tra user đã từng đi xe của nhà xe này chưa
            const pool = await poolPromise;
            const checkTrip = await pool.request()
                .input('userId', sql.Int, userId)
                .input('companyId', sql.Int, companyId)
                .query(`
                SELECT t.id FROM Tickets tk
                JOIN Trips t ON tk.tripId = t.id
                JOIN Vehicles v ON t.vehicleId = v.id
                WHERE tk.userId = @userId AND v.partnerId = @companyId
                AND tk.status IN ('USED', 'PAID')
            `);

            console.log('📌 Kiểm tra chuyến xe:', checkTrip.recordset);

            if (checkTrip.recordset.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ có thể đánh giá nhà xe đã từng đi'
                });
            }

            // Tạo đánh giá
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .input('companyId', sql.Int, companyId)
                .input('rating', sql.Int, rating)
                .input('comment', sql.NVarChar, comment || null)
                .query(`
                INSERT INTO CompanyReviews (userId, companyId, rating, comment, status, createdAt)
                OUTPUT INSERTED.*
                VALUES (@userId, @companyId, @rating, @comment, 'PENDING', GETDATE())
            `);

            console.log('✅ Đã lưu đánh giá:', result.recordset[0]);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cảm ơn bạn đã đánh giá!'
            });

        } catch (error) {
            console.error('❌ Lỗi createReview:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy đánh giá theo nhà xe
    getReviewsByCompany: async (req, res) => {
        try {
            const { companyId } = req.params;
            const { limit = 20 } = req.query;

            const reviews = await CompanyReview.getByCompanyId(companyId, limit);
            const stats = await CompanyReview.getStats(companyId);

            res.json({
                success: true,
                data: reviews,
                stats: {
                    averageRating: stats?.averageRating || 0,
                    totalReviews: stats?.totalReviews || 0,
                    rating5: stats?.rating5 || 0,
                    rating4: stats?.rating4 || 0,
                    rating3: stats?.rating3 || 0,
                    rating2: stats?.rating2 || 0,
                    rating1: stats?.rating1 || 0
                }
            });

        } catch (error) {
            console.error('❌ Lỗi getReviewsByCompany:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Admin: Lấy tất cả đánh giá
    getAllReviews: async (req, res) => {
        try {
            const { status } = req.query;
            const reviews = await CompanyReview.getAll({ status });

            res.json({
                success: true,
                data: reviews
            });

        } catch (error) {
            console.error('❌ Lỗi getAllReviews:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Admin: Cập nhật trạng thái
    updateReviewStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, adminNote } = req.body;

            const review = await CompanyReview.updateStatus(id, status, adminNote);

            res.json({
                success: true,
                data: review,
                message: 'Cập nhật trạng thái thành công'
            });

        } catch (error) {
            console.error('❌ Lỗi updateReviewStatus:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = companyReviewController;