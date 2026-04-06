// BackEnd/controllers/review.controller.js
const sql = require('mssql');
const { poolPromise } = require('../config/db');

const reviewController = {

    // ================= GET ALL TRIP REVIEWS (ADMIN) =================
    getAllTripReviews: async (req, res) => {
        try {
            const pool = await poolPromise;

            const result = await pool.request()
                .query(`
                SELECT 
                    r.*,
                    u.name as userName,
                    u.email as userEmail,
                    sFrom.name as fromStation,
                    sTo.name as toStation
                FROM TripReviews r
                JOIN Users u ON r.userId = u.id
                JOIN Trips t ON r.tripId = t.id
                JOIN Stations sFrom ON t.fromStationId = sFrom.id
                JOIN Stations sTo ON t.toStationId = sTo.id
                ORDER BY r.createdAt DESC
            `);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (error) {
            console.error('❌ Lỗi getAllTripReviews:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },


    // ================= GET ALL COMPANY REVIEWS (ADMIN) =================
    getAllCompanyReviews: async (req, res) => {
        try {
            const pool = await poolPromise;

            const result = await pool.request()
                .query(`
                SELECT 
                    r.*,
                    u.name as userName,
                    u.email as userEmail,
                    c.name as companyName
                FROM CompanyReviews r
                JOIN Users u ON r.userId = u.id
                JOIN PassengerCarCompanies c ON r.companyId = c.id
                ORDER BY r.createdAt DESC
            `);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (error) {
            console.error('❌ Lỗi getAllCompanyReviews:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },



    // Đánh giá chuyến xe
    createTripReview: async (req, res) => {
        try {
            const { tripId, rating, comment } = req.body;
            const userId = req.user.id;

            console.log('📌 createTripReview - userId:', userId, 'tripId:', tripId, 'rating:', rating);

            const pool = await poolPromise;

            // Kiểm tra user đã đi chuyến này chưa
            const checkTicket = await pool.request()
                .input('userId', sql.Int, userId)
                .input('tripId', sql.Int, tripId)
                .query(`
                    SELECT id FROM Tickets 
                    WHERE userId = @userId AND tripId = @tripId 
                    AND status IN ('USED', 'PAID')
                `);

            if (checkTicket.recordset.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ có thể đánh giá chuyến xe đã đi'
                });
            }

            // Tạo đánh giá
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .input('tripId', sql.Int, tripId)
                .input('rating', sql.Int, rating)
                .input('comment', sql.NVarChar, comment || null)
                .query(`
                    INSERT INTO TripReviews (userId, tripId, rating, comment, status, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@userId, @tripId, @rating, @comment, 'PENDING', GETDATE())
                `);

            console.log('✅ Đã lưu đánh giá chuyến xe:', result.recordset[0]);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cảm ơn bạn đã đánh giá!'
            });

        } catch (error) {
            console.error('❌ Lỗi createTripReview:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy đánh giá chuyến xe
    getTripReviews: async (req, res) => {
        try {
            const { tripId } = req.params;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('tripId', sql.Int, tripId)
                .query(`
                    SELECT TOP 20 
                        r.*,
                        u.name as userName,
                        u.email as userEmail
                    FROM TripReviews r
                    JOIN Users u ON r.userId = u.id
                    WHERE r.tripId = @tripId AND r.status = 'APPROVED'
                    ORDER BY r.createdAt DESC
                `);

            const stats = await pool.request()
                .input('tripId', sql.Int, tripId)
                .query(`
                    SELECT 
                        ISNULL(AVG(rating), 0) as averageRating,
                        COUNT(*) as totalReviews
                    FROM TripReviews
                    WHERE tripId = @tripId AND status = 'APPROVED'
                `);

            res.json({
                success: true,
                data: result.recordset,
                stats: {
                    averageRating: stats.recordset[0]?.averageRating || 0,
                    totalReviews: stats.recordset[0]?.totalReviews || 0
                }
            });

        } catch (error) {
            console.error('❌ Lỗi getTripReviews:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Đánh giá nhà xe
    createCompanyReview: async (req, res) => {
        try {
            const { companyId, rating, comment } = req.body;
            const userId = req.user.id;

            console.log('📌 createCompanyReview - userId:', userId, 'companyId:', companyId, 'rating:', rating);

            const pool = await poolPromise;

            // Kiểm tra user đã từng đi xe của nhà xe này chưa
            const checkTrip = await pool.request()
                .input('userId', sql.Int, userId)
                .input('companyId', sql.Int, companyId)
                .query(`
                    SELECT TOP 1 t.id FROM Tickets tk
                    JOIN Trips t ON tk.tripId = t.id
                    JOIN Vehicles v ON t.vehicleId = v.id
                    WHERE tk.userId = @userId AND v.partnerId = @companyId
                    AND tk.status IN ('USED', 'PAID')
                `);

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

            console.log('✅ Đã lưu đánh giá nhà xe:', result.recordset[0]);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cảm ơn bạn đã đánh giá!'
            });

        } catch (error) {
            console.error('❌ Lỗi createCompanyReview:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy đánh giá nhà xe
    getCompanyReviews: async (req, res) => {
        try {
            const { companyId } = req.params;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('companyId', sql.Int, companyId)
                .query(`
                    SELECT TOP 20 
                        r.*,
                        u.name as userName,
                        u.email as userEmail
                    FROM CompanyReviews r
                    JOIN Users u ON r.userId = u.id
                    WHERE r.companyId = @companyId AND r.status = 'APPROVED'
                    ORDER BY r.createdAt DESC
                `);

            const stats = await pool.request()
                .input('companyId', sql.Int, companyId)
                .query(`
                    SELECT 
                        ISNULL(AVG(rating), 0) as averageRating,
                        COUNT(*) as totalReviews
                    FROM CompanyReviews
                    WHERE companyId = @companyId AND status = 'APPROVED'
                `);

            res.json({
                success: true,
                data: result.recordset,
                stats: {
                    averageRating: stats.recordset[0]?.averageRating || 0,
                    totalReviews: stats.recordset[0]?.totalReviews || 0
                }
            });

        } catch (error) {
            console.error('❌ Lỗi getCompanyReviews:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = reviewController;