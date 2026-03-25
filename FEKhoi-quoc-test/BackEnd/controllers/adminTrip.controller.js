// controllers/adminTrip.controller.js
const sql = require('mssql');
const { poolPromise } = require('../config/db');

const adminTripController = {
    // Lấy danh sách tất cả chuyến xe
    getAllTrips: async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    t.id,
                    t.fromStationId,
                    t.toStationId,
                    sFrom.name as fromStation,
                    sTo.name as toStation,
                    t.startTime,
                    t.price,
                    t.estimatedDuration,
                    t.vehicleId,
                    v.name as vehicleName,
                    v.type as vehicleType,
                    v.numberOfFloors,
                    v.partnerId,
                    pc.name as companyName,
                    t.isActive,
                    t.createdAt
                FROM Trips t
                LEFT JOIN Stations sFrom ON t.fromStationId = sFrom.id
                LEFT JOIN Stations sTo ON t.toStationId = sTo.id
                LEFT JOIN Vehicles v ON t.vehicleId = v.id
                LEFT JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
                ORDER BY t.startTime DESC
            `);

            console.log("📊 Số chuyến xe:", result.recordset.length);
            if (result.recordset.length > 0) {
                console.log("📌 Mẫu dữ liệu:", result.recordset[0]);
            }

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            console.error('Lỗi lấy chuyến xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy chi tiết chuyến xe
    getTripById: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT 
                        t.*,
                        sFrom.name as fromStation,
                        sTo.name as toStation,
                        v.name as vehicleName,
                        v.type as vehicleType,
                        v.numberOfFloors,
                        pc.name as companyName
                    FROM Trips t
                    LEFT JOIN Stations sFrom ON t.fromStationId = sFrom.id
                    LEFT JOIN Stations sTo ON t.toStationId = sTo.id
                    LEFT JOIN Vehicles v ON t.vehicleId = v.id
                    LEFT JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
                    WHERE t.id = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy chuyến xe'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });
        } catch (error) {
            console.error('Lỗi lấy chi tiết chuyến xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Tạo chuyến xe mới
    createTrip: async (req, res) => {
        try {
            const { fromStationId, toStationId, vehicleId, startTime, price, estimatedDuration, isActive } = req.body;
            const pool = await poolPromise;

            // Kiểm tra xe có tồn tại không
            const vehicleCheck = await pool.request()
                .input('vehicleId', sql.Int, vehicleId)
                .query('SELECT id FROM Vehicles WHERE id = @vehicleId');

            if (vehicleCheck.recordset.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Xe không tồn tại'
                });
            }

            // Kiểm tra trạm đi và đến
            const stationCheck = await pool.request()
                .input('fromStationId', sql.Int, fromStationId)
                .input('toStationId', sql.Int, toStationId)
                .query(`
                    SELECT id FROM Stations WHERE id = @fromStationId
                    SELECT id FROM Stations WHERE id = @toStationId
                `);

            if (stationCheck.recordsets[0].length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạm đi không tồn tại'
                });
            }
            if (stationCheck.recordsets[1].length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạm đến không tồn tại'
                });
            }

            const result = await pool.request()
                .input('fromStationId', sql.Int, fromStationId)
                .input('toStationId', sql.Int, toStationId)
                .input('vehicleId', sql.Int, vehicleId)
                .input('startTime', sql.DateTime, startTime)
                .input('price', sql.Decimal(10, 2), price)
                .input('estimatedDuration', sql.Int, estimatedDuration)
                .input('isActive', sql.Bit, isActive !== undefined ? isActive : 1)
                .query(`
                    INSERT INTO Trips (fromStationId, toStationId, vehicleId, startTime, price, estimatedDuration, isActive, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@fromStationId, @toStationId, @vehicleId, @startTime, @price, @estimatedDuration, @isActive, GETDATE())
                `);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Tạo chuyến xe thành công'
            });
        } catch (error) {
            console.error('Lỗi tạo chuyến xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật chuyến xe
    updateTrip: async (req, res) => {
        try {
            const { id } = req.params;
            const { fromStationId, toStationId, vehicleId, startTime, price, estimatedDuration, isActive } = req.body;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('fromStationId', sql.Int, fromStationId)
                .input('toStationId', sql.Int, toStationId)
                .input('vehicleId', sql.Int, vehicleId)
                .input('startTime', sql.DateTime, startTime)
                .input('price', sql.Decimal(10, 2), price)
                .input('estimatedDuration', sql.Int, estimatedDuration)
                .input('isActive', sql.Bit, isActive)
                .query(`
                    UPDATE Trips
                    SET fromStationId = @fromStationId,
                        toStationId = @toStationId,
                        vehicleId = @vehicleId,
                        startTime = @startTime,
                        price = @price,
                        estimatedDuration = @estimatedDuration,
                        isActive = @isActive,
                        updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy chuyến xe'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cập nhật chuyến xe thành công'
            });
        } catch (error) {
            console.error('Lỗi cập nhật chuyến xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa chuyến xe
    deleteTrip: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await poolPromise;

            // Kiểm tra xem có vé nào cho chuyến này không
            const ticketCheck = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as count FROM Tickets WHERE tripId = @id');

            if (ticketCheck.recordset[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa chuyến xe này vì đã có vé được đặt'
                });
            }

            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Trips WHERE id = @id');

            res.json({
                success: true,
                message: 'Xóa chuyến xe thành công'
            });
        } catch (error) {
            console.error('Lỗi xóa chuyến xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Thống kê chuyến xe
    getTripStats: async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    COUNT(*) as totalTrips,
                    SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeTrips,
                    SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactiveTrips,
                    AVG(price) as avgPrice,
                    MIN(price) as minPrice,
                    MAX(price) as maxPrice
                FROM Trips
            `);

            res.json({
                success: true,
                data: result.recordset[0]
            });
        } catch (error) {
            console.error('Lỗi lấy thống kê chuyến xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = adminTripController;