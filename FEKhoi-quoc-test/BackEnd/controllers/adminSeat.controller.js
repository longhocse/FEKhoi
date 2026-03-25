const sql = require('mssql');
const { poolPromise } = require('../config/db');

const adminSeatController = {
    // Lấy sơ đồ ghế theo vehicleId
    getSeatsByVehicle: async (req, res) => {
        try {
            const { vehicleId } = req.params;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('vehicleId', sql.Int, vehicleId)
                .query(`
                    SELECT 
                        id,
                        name,
                        floor,
                        type,
                        status,
                        createdAt
                    FROM Seats
                    WHERE vehicleId = @vehicleId
                    ORDER BY floor, name
                `);

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            console.error('Lỗi lấy sơ đồ ghế:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật trạng thái ghế
    updateSeatStatus: async (req, res) => {
        try {
            const { seatId } = req.params;
            const { status } = req.body;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('seatId', sql.Int, seatId)
                .input('status', sql.VarChar(20), status)
                .query(`
                    UPDATE Seats
                    SET status = @status
                    OUTPUT INSERTED.*
                    WHERE id = @seatId
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ghế'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cập nhật trạng thái ghế thành công'
            });
        } catch (error) {
            console.error('Lỗi cập nhật ghế:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Tạo sơ đồ ghế cho xe mới
    createSeatsForVehicle: async (req, res) => {
        try {
            const { vehicleId, seats } = req.body;
            const pool = await poolPromise;

            // Xóa ghế cũ nếu có
            await pool.request()
                .input('vehicleId', sql.Int, vehicleId)
                .query('DELETE FROM Seats WHERE vehicleId = @vehicleId');

            // Thêm ghế mới
            for (const seat of seats) {
                await pool.request()
                    .input('vehicleId', sql.Int, vehicleId)
                    .input('name', sql.VarChar(10), seat.name)
                    .input('floor', sql.Int, seat.floor || 1)
                    .input('type', sql.VarChar(20), seat.type || 'NORMAL')
                    .input('status', sql.VarChar(20), 'AVAILABLE')
                    .query(`
                        INSERT INTO Seats (vehicleId, name, floor, type, status, createdAt)
                        VALUES (@vehicleId, @name, @floor, @type, @status, GETDATE())
                    `);
            }

            res.json({
                success: true,
                message: `Đã tạo ${seats.length} ghế cho xe`
            });
        } catch (error) {
            console.error('Lỗi tạo sơ đồ ghế:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy thống kê ghế theo xe
    getSeatStats: async (req, res) => {
        try {
            const { vehicleId } = req.params;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('vehicleId', sql.Int, vehicleId)
                .query(`
                    SELECT 
                        COUNT(*) as totalSeats,
                        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as availableSeats,
                        SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END) as bookedSeats,
                        SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenanceSeats,
                        SUM(CASE WHEN type = 'VIP' THEN 1 ELSE 0 END) as vipSeats,
                        SUM(CASE WHEN type = 'NORMAL' THEN 1 ELSE 0 END) as normalSeats
                    FROM Seats
                    WHERE vehicleId = @vehicleId
                `);

            res.json({
                success: true,
                data: result.recordset[0]
            });
        } catch (error) {
            console.error('Lỗi lấy thống kê ghế:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = adminSeatController;