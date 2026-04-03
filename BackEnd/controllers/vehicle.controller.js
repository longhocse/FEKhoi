// controllers/vehicle.controller.js
const sql = require('mssql');
const { poolPromise } = require('../config/db');

console.log('🟢 Đang load vehicle.controller.js');

const vehicleController = {
    // Lấy tất cả xe
    getAllVehicles: async (req, res) => {
        try {
            console.log('📌 getAllVehicles được gọi');
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    v.id,
                    v.name,
                    v.description,
                    v.type,
                    v.numberOfFloors,
                    v.partnerId,
                    v.licensePlate,
                    v.isActive,
                    v.createdAt,
                    pc.name as companyName
                FROM Vehicles v
                LEFT JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
                ORDER BY v.id
            `);

            console.log(`📊 Tìm thấy ${result.recordset.length} xe`);

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            console.error('❌ Lỗi lấy danh sách xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy chi tiết xe
    getVehicleById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`📌 getVehicleById được gọi, id: ${id}`);

            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT 
                        v.*,
                        pc.name as companyName
                    FROM Vehicles v
                    LEFT JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
                    WHERE v.id = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy xe'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });
        } catch (error) {
            console.error('❌ Lỗi lấy chi tiết xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Tạo xe mới (admin)
    createVehicle: async (req, res) => {
        try {
            const { name, description, type, numberOfFloors, partnerId, licensePlate, isActive } = req.body;
            console.log('📌 createVehicle được gọi:', { name, licensePlate });

            const pool = await poolPromise;

            // Kiểm tra biển số đã tồn tại
            const checkPlate = await pool.request()
                .input('licensePlate', sql.VarChar, licensePlate)
                .query('SELECT id FROM Vehicles WHERE licensePlate = @licensePlate');

            if (checkPlate.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Biển số xe đã tồn tại'
                });
            }

            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description || null)
                .input('type', sql.NVarChar, type || 'STANDARD')
                .input('numberOfFloors', sql.Int, numberOfFloors || 1)
                .input('partnerId', sql.Int, partnerId)
                .input('licensePlate', sql.VarChar, licensePlate)
                .input('isActive', sql.Bit, isActive !== undefined ? isActive : 1)
                .query(`
                    INSERT INTO Vehicles (name, description, type, numberOfFloors, partnerId, licensePlate, isActive, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@name, @description, @type, @numberOfFloors, @partnerId, @licensePlate, @isActive, GETDATE())
                `);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Thêm xe thành công'
            });
        } catch (error) {
            console.error('❌ Lỗi tạo xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật xe (admin)
    updateVehicle: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, type, numberOfFloors, partnerId, licensePlate, isActive } = req.body;
            console.log(`📌 updateVehicle được gọi, id: ${id}`);

            const pool = await poolPromise;

            // Kiểm tra biển số trùng (trừ chính nó)
            const checkPlate = await pool.request()
                .input('licensePlate', sql.VarChar, licensePlate)
                .input('id', sql.Int, id)
                .query('SELECT id FROM Vehicles WHERE licensePlate = @licensePlate AND id != @id');

            if (checkPlate.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Biển số xe đã tồn tại'
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description || null)
                .input('type', sql.NVarChar, type)
                .input('numberOfFloors', sql.Int, numberOfFloors)
                .input('partnerId', sql.Int, partnerId)
                .input('licensePlate', sql.VarChar, licensePlate)
                .input('isActive', sql.Bit, isActive)
                .query(`
                    UPDATE Vehicles
                    SET name = @name,
                        description = @description,
                        type = @type,
                        numberOfFloors = @numberOfFloors,
                        partnerId = @partnerId,
                        licensePlate = @licensePlate,
                        isActive = @isActive,
                        updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy xe'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cập nhật xe thành công'
            });
        } catch (error) {
            console.error('❌ Lỗi cập nhật xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa xe (admin)
    deleteVehicle: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`📌 deleteVehicle được gọi, id: ${id}`);

            const pool = await poolPromise;

            // Kiểm tra xem xe có đang được sử dụng không
            const checkTrips = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as count FROM Trips WHERE vehicleId = @id');

            if (checkTrips.recordset[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa xe này vì đang có chuyến xe sử dụng'
                });
            }

            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Vehicles WHERE id = @id');

            res.json({
                success: true,
                message: 'Xóa xe thành công'
            });
        } catch (error) {
            console.error('❌ Lỗi xóa xe:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = vehicleController;