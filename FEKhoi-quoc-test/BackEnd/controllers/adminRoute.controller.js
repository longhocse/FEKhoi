const sql = require('mssql');
const { poolPromise } = require('../config/db');

const adminRouteController = {
    // Lấy danh sách tất cả tuyến đường
    getAllRoutes: async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    id,
                    name,
                    address,
                    province,
                    createdAt
                FROM Stations
                ORDER BY province, name
            `);
            res.json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            console.error('Lỗi lấy danh sách tuyến:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Thêm tuyến đường mới
    createRoute: async (req, res) => {
        try {
            const { name, address, province } = req.body;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('address', sql.NVarChar, address)
                .input('province', sql.NVarChar, province)
                .query(`
                    INSERT INTO Stations (name, address, province, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@name, @address, @province, GETDATE())
                `);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Thêm tuyến đường thành công'
            });
        } catch (error) {
            console.error('Lỗi thêm tuyến:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật tuyến đường
    updateRoute: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, address, province } = req.body;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, name)
                .input('address', sql.NVarChar, address)
                .input('province', sql.NVarChar, province)
                .query(`
                    UPDATE Stations
                    SET name = @name, address = @address, province = @province
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy tuyến đường'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cập nhật tuyến đường thành công'
            });
        } catch (error) {
            console.error('Lỗi cập nhật tuyến:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa tuyến đường
    deleteRoute: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await poolPromise;

            // Kiểm tra xem có chuyến xe nào sử dụng tuyến này không
            const checkTrips = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT COUNT(*) as count FROM Trips 
                    WHERE fromStationId = @id OR toStationId = @id
                `);

            if (checkTrips.recordset[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa tuyến đường này vì đang có chuyến xe sử dụng'
                });
            }

            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Stations WHERE id = @id');

            res.json({
                success: true,
                message: 'Xóa tuyến đường thành công'
            });
        } catch (error) {
            console.error('Lỗi xóa tuyến:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = adminRouteController;