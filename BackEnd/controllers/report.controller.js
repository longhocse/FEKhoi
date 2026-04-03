// BackEnd/controllers/report.controller.js
const sql = require('mssql');
const { poolPromise } = require('../config/db'); // THÊM DÒNG NÀY
const Report = require('../models/reportModel');

const reportController = {
    // Tạo báo cáo mới
    createReport: async (req, res) => {
        try {
            const { title, category, description, ticketId, tripId } = req.body;
            const userId = req.user.id;

            if (!title || !category || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ thông tin'
                });
            }

            const pool = await poolPromise; // Giờ đã có poolPromise
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .input('title', sql.NVarChar, title)
                .input('category', sql.VarChar(50), category)
                .input('description', sql.NVarChar, description)
                .input('ticketId', sql.Int, ticketId || null)
                .input('tripId', sql.Int, tripId || null)
                .query(`
                    INSERT INTO Reports (userId, title, category, description, ticketId, tripId, status, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@userId, @title, @category, @description, @ticketId, @tripId, 'PENDING', GETDATE())
                `);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Báo cáo đã được gửi thành công!'
            });

        } catch (error) {
            console.error('❌ Lỗi createReport:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy tất cả báo cáo
    getAllReports: async (req, res) => {
        try {
            console.log('📌 getAllReports - admin called');

            const { status, category } = req.query;
            const reports = await Report.getAll({ status, category });

            res.json({
                success: true,
                data: reports
            });

        } catch (error) {
            console.error('❌ Lỗi getAllReports:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật trạng thái báo cáo
    updateReportStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, adminNote } = req.body;

            const report = await Report.updateStatus(id, status, adminNote);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy báo cáo'
                });
            }

            res.json({
                success: true,
                data: report,
                message: 'Cập nhật trạng thái thành công'
            });

        } catch (error) {
            console.error('❌ Lỗi updateReportStatus:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy thống kê báo cáo
    getReportStats: async (req, res) => {
        try {
            const stats = await Report.getStats();

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('❌ Lỗi getReportStats:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = reportController;