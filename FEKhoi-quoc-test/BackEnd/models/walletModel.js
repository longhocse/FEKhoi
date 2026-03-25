const sql = require('mssql');
const { poolPromise } = require('../config/db');

const Wallet = {
    // Lấy thông tin ví theo userId
    getByUserId: async (userId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT w.*, u.name as userName, u.email, u.phoneNumber, u.role
                    FROM Wallets w
                    JOIN Users u ON w.userId = u.id
                    WHERE w.userId = @userId
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Lấy thông tin ví theo walletId
    getById: async (walletId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('walletId', sql.Int, walletId)
                .query(`
                    SELECT w.*, u.name as userName, u.email, u.phoneNumber
                    FROM Wallets w
                    JOIN Users u ON w.userId = u.id
                    WHERE w.id = @walletId
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Tạo ví mới cho user
    create: async (userId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .input('balance', sql.Decimal(12, 2), 0)
                .input('currency', sql.VarChar(10), 'VND')
                .input('isLocked', sql.Bit, 0)
                .query(`
                    INSERT INTO Wallets (userId, balance, currency, isLocked, createdAt, updatedAt)
                    OUTPUT INSERTED.*
                    VALUES (@userId, @balance, @currency, @isLocked, GETDATE(), GETDATE())
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Nạp tiền vào ví
    topUp: async (walletId, amount, description) => {
        try {
            const pool = await poolPromise;

            // Kiểm tra ví có bị khóa không
            const walletCheck = await pool.request()
                .input('walletId', sql.Int, walletId)
                .query('SELECT isLocked FROM Wallets WHERE id = @walletId');

            if (walletCheck.recordset[0]?.isLocked) {
                throw new Error('Ví đang bị khóa');
            }

            // Cập nhật số dư ví
            const walletResult = await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('amount', sql.Decimal(12, 2), amount)
                .query(`
                    UPDATE Wallets
                    SET balance = balance + @amount, updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @walletId
                `);

            // Tạo giao dịch
            await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('amount', sql.Decimal(12, 2), amount)
                .input('type', sql.VarChar(20), 'TOPUP')
                .input('status', sql.VarChar(20), 'SUCCESS')
                .input('description', sql.NVarChar(255), description)
                .query(`
                    INSERT INTO Transactions (walletId, amount, type, status, description, createdAt)
                    VALUES (@walletId, @amount, @type, @status, @description, GETDATE())
                `);

            return walletResult.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Thanh toán bằng ví
    pay: async (walletId, amount, description, referenceId = null) => {
        try {
            const pool = await poolPromise;

            // Kiểm tra số dư và trạng thái ví
            const walletCheck = await pool.request()
                .input('walletId', sql.Int, walletId)
                .query('SELECT balance, isLocked FROM Wallets WHERE id = @walletId');

            if (!walletCheck.recordset[0]) {
                throw new Error('Không tìm thấy ví');
            }

            if (walletCheck.recordset[0].isLocked) {
                throw new Error('Ví đang bị khóa');
            }

            if (walletCheck.recordset[0].balance < amount) {
                throw new Error('Số dư không đủ');
            }

            // Cập nhật số dư ví
            const walletResult = await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('amount', sql.Decimal(12, 2), amount)
                .query(`
                    UPDATE Wallets
                    SET balance = balance - @amount, updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @walletId
                `);

            // Tạo giao dịch
            await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('amount', sql.Decimal(12, 2), amount)
                .input('type', sql.VarChar(20), 'PAYMENT')
                .input('status', sql.VarChar(20), 'SUCCESS')
                .input('description', sql.NVarChar(255), description)
                .input('referenceId', sql.VarChar(100), referenceId)
                .query(`
                    INSERT INTO Transactions (walletId, amount, type, status, description, referenceId, createdAt)
                    VALUES (@walletId, @amount, @type, @status, @description, @referenceId, GETDATE())
                `);

            return walletResult.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Rút tiền từ ví
    withdraw: async (walletId, amount, description, bankInfo) => {
        try {
            const pool = await poolPromise;

            // Kiểm tra số dư
            const walletCheck = await pool.request()
                .input('walletId', sql.Int, walletId)
                .query('SELECT balance, isLocked FROM Wallets WHERE id = @walletId');

            if (!walletCheck.recordset[0]) {
                throw new Error('Không tìm thấy ví');
            }

            if (walletCheck.recordset[0].isLocked) {
                throw new Error('Ví đang bị khóa');
            }

            if (walletCheck.recordset[0].balance < amount) {
                throw new Error('Số dư không đủ');
            }

            // Cập nhật số dư ví
            const walletResult = await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('amount', sql.Decimal(12, 2), amount)
                .query(`
                    UPDATE Wallets
                    SET balance = balance - @amount, updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @walletId
                `);

            // Tạo giao dịch
            await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('amount', sql.Decimal(12, 2), amount)
                .input('type', sql.VarChar(20), 'WITHDRAW')
                .input('status', sql.VarChar(20), 'PENDING')
                .input('description', sql.NVarChar(255),
                    `${description} - Bank: ${bankInfo.bankName}, Account: ${bankInfo.accountNumber}`)
                .query(`
                    INSERT INTO Transactions (walletId, amount, type, status, description, createdAt)
                    VALUES (@walletId, @amount, @type, @status, @description, GETDATE())
                `);

            return walletResult.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Lấy lịch sử giao dịch
    getTransactions: async (walletId, limit = 20) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('limit', sql.Int, limit)
                .query(`
                    SELECT TOP (@limit) *
                    FROM Transactions
                    WHERE walletId = @walletId
                    ORDER BY createdAt DESC
                `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Admin: Lấy tất cả ví
    getAll: async () => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`
                    SELECT w.*, u.name as userName, u.email, u.phoneNumber, u.role
                    FROM Wallets w
                    JOIN Users u ON w.userId = u.id
                    ORDER BY w.createdAt DESC
                `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Admin: Khóa/Mở khóa ví
    toggleLock: async (walletId, isLocked) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('walletId', sql.Int, walletId)
                .input('isLocked', sql.Bit, isLocked)
                .query(`
                    UPDATE Wallets
                    SET isLocked = @isLocked, updatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE id = @walletId
                `);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Wallet;