const sql = require('mssql');
const { poolPromise } = require('../config/db');

const adminPromotionController = {
    // Lấy danh sách khuyến mãi
    getAllPromotions: async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    id,
                    code,
                    name,
                    description,
                    discountType,
                    discountValue,
                    minOrderValue,
                    maxDiscount,
                    startDate,
                    endDate,
                    usageLimit,
                    usedCount,
                    isActive,
                    createdAt
                FROM Promotions
                ORDER BY createdAt DESC
            `);

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (error) {
            console.error('Lỗi lấy danh sách khuyến mãi:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Tạo khuyến mãi mới
    createPromotion: async (req, res) => {
        try {
            const { code, name, description, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit, isActive } = req.body;
            const pool = await poolPromise;

            // Kiểm tra mã code đã tồn tại
            const checkCode = await pool.request()
                .input('code', sql.NVarChar, code)
                .query('SELECT id FROM Promotions WHERE code = @code');

            if (checkCode.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã khuyến mãi đã tồn tại'
                });
            }

            const result = await pool.request()
                .input('code', sql.NVarChar, code)
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('discountType', sql.VarChar(20), discountType)
                .input('discountValue', sql.Decimal(10, 2), discountValue)
                .input('minOrderValue', sql.Decimal(10, 2), minOrderValue || 0)
                .input('maxDiscount', sql.Decimal(10, 2), maxDiscount || null)
                .input('startDate', sql.DateTime, startDate)
                .input('endDate', sql.DateTime, endDate)
                .input('usageLimit', sql.Int, usageLimit || 1)
                .input('isActive', sql.Bit, isActive !== undefined ? isActive : 1)
                .query(`
                    INSERT INTO Promotions (code, name, description, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit, isActive, createdAt)
                    OUTPUT INSERTED.*
                    VALUES (@code, @name, @description, @discountType, @discountValue, @minOrderValue, @maxDiscount, @startDate, @endDate, @usageLimit, @isActive, GETDATE())
                `);

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Tạo khuyến mãi thành công'
            });
        } catch (error) {
            console.error('Lỗi tạo khuyến mãi:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật khuyến mãi
    updatePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            const { code, name, description, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit, isActive } = req.body;
            const pool = await poolPromise;

            // Kiểm tra mã code trùng
            const checkCode = await pool.request()
                .input('code', sql.NVarChar, code)
                .input('id', sql.Int, id)
                .query('SELECT id FROM Promotions WHERE code = @code AND id != @id');

            if (checkCode.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã khuyến mãi đã tồn tại'
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('code', sql.NVarChar, code)
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('discountType', sql.VarChar(20), discountType)
                .input('discountValue', sql.Decimal(10, 2), discountValue)
                .input('minOrderValue', sql.Decimal(10, 2), minOrderValue)
                .input('maxDiscount', sql.Decimal(10, 2), maxDiscount)
                .input('startDate', sql.DateTime, startDate)
                .input('endDate', sql.DateTime, endDate)
                .input('usageLimit', sql.Int, usageLimit)
                .input('isActive', sql.Bit, isActive)
                .query(`
                    UPDATE Promotions
                    SET code = @code,
                        name = @name,
                        description = @description,
                        discountType = @discountType,
                        discountValue = @discountValue,
                        minOrderValue = @minOrderValue,
                        maxDiscount = @maxDiscount,
                        startDate = @startDate,
                        endDate = @endDate,
                        usageLimit = @usageLimit,
                        isActive = @isActive,
                        updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @id
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khuyến mãi'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0],
                message: 'Cập nhật khuyến mãi thành công'
            });
        } catch (error) {
            console.error('Lỗi cập nhật khuyến mãi:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa khuyến mãi
    deletePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await poolPromise;

            // Kiểm tra xem đã được sử dụng chưa
            const usageCheck = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as count FROM PromotionUsage WHERE promotionId = @id');

            if (usageCheck.recordset[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa khuyến mãi này vì đã có người sử dụng'
                });
            }

            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Promotions WHERE id = @id');

            res.json({
                success: true,
                message: 'Xóa khuyến mãi thành công'
            });
        } catch (error) {
            console.error('Lỗi xóa khuyến mãi:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Áp dụng khuyến mãi (public)
    applyPromotion: async (req, res) => {
        try {
            const { code, orderAmount } = req.body;
            const pool = await poolPromise;

            const result = await pool.request()
                .input('code', sql.NVarChar, code)
                .query(`
                    SELECT * FROM Promotions
                    WHERE code = @code 
                    AND isActive = 1
                    AND GETDATE() BETWEEN startDate AND endDate
                    AND (usedCount < usageLimit OR usageLimit = 0)
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn'
                });
            }

            const promotion = result.recordset[0];

            if (orderAmount < promotion.minOrderValue) {
                return res.status(400).json({
                    success: false,
                    message: `Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString()}đ để áp dụng mã này`
                });
            }

            let discountAmount = 0;
            if (promotion.discountType === 'PERCENT') {
                discountAmount = orderAmount * promotion.discountValue / 100;
                if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
                    discountAmount = promotion.maxDiscount;
                }
            } else {
                discountAmount = promotion.discountValue;
            }

            res.json({
                success: true,
                data: {
                    discountAmount,
                    finalAmount: orderAmount - discountAmount,
                    promotion: {
                        code: promotion.code,
                        name: promotion.name,
                        discountType: promotion.discountType,
                        discountValue: promotion.discountValue
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi áp dụng khuyến mãi:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = adminPromotionController;