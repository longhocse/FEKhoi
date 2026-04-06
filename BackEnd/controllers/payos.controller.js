// BackEnd/controllers/payos.controller.js
const axios = require('axios');
const crypto = require('crypto');
const { poolPromise, sql } = require("../config/db");

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

const PAYOS_API_URL = 'https://api-merchant.payos.vn/v2/payment-requests';

// Hàm tạo signature đúng theo yêu cầu PayOS
function createSignature(data) {
    // Sắp xếp các field theo thứ tự alphabet
    const sortedData = {
        amount: data.amount,
        cancelUrl: data.cancelUrl,
        description: data.description,
        orderCode: data.orderCode,
        returnUrl: data.returnUrl
    };

    // Tạo chuỗi string để ký
    const signString = Object.keys(sortedData)
        .sort()
        .map(key => `${key}=${sortedData[key]}`)
        .join('&');

    console.log("Sign string:", signString);

    // Tạo signature bằng HMAC SHA256
    return crypto
        .createHmac('sha256', PAYOS_CHECKSUM_KEY)
        .update(signString, 'utf-8')
        .digest('hex');
}

// Tạo link thanh toán nạp tiền
// BackEnd/controllers/payos.controller.js
// BackEnd/controllers/payos.controller.js
exports.createPayment = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user.id;

        console.log("=== CREATE PAYOS PAYMENT ===");
        console.log("User ID:", userId);
        console.log("Amount:", amount);

        if (!amount || amount < 10000) {
            return res.status(400).json({
                success: false,
                message: "Số tiền nạp tối thiểu 10,000đ"
            });
        }

        const orderCode = Date.now();
        const expiredAt = Math.floor(Date.now() / 1000) + 15 * 60;

        // Tạo signature
        const signData = {
            amount: amount,
            cancelUrl: process.env.PAYOS_CANCEL_URL,
            description: description || `Nap tien vi BusGO`,
            orderCode: orderCode,
            returnUrl: process.env.PAYOS_RETURN_URL
        };

        const signString = Object.keys(signData)
            .sort()
            .map(key => `${key}=${signData[key]}`)
            .join('&');

        const signature = crypto
            .createHmac('sha256', PAYOS_CHECKSUM_KEY)
            .update(signString, 'utf-8')
            .digest('hex');

        const paymentData = {
            orderCode: orderCode,
            amount: amount,
            description: description || `Nap tien vi BusGO`,
            cancelUrl: process.env.PAYOS_CANCEL_URL,
            returnUrl: process.env.PAYOS_RETURN_URL,
            buyerName: req.user.name || 'Customer',
            buyerEmail: req.user.email,
            expiredAt: expiredAt,
            signature: signature
        };

        const response = await axios.post(PAYOS_API_URL, paymentData, {
            headers: {
                'x-client-id': PAYOS_CLIENT_ID,
                'x-api-key': PAYOS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log("PayOS response:", response.data);

        if (response.data.code === '00') {
            const pool = await poolPromise;

            // 1. LƯU GIAO DỊCH PAYOS
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('amount', sql.Decimal(12, 2), amount)
                .input('orderId', sql.NVarChar, orderCode.toString())
                .input('paymentId', sql.NVarChar, response.data.data.paymentLinkId || '')
                .input('status', sql.VarChar(20), 'PENDING')
                .input('paymentUrl', sql.NVarChar, response.data.data.checkoutUrl)
                .query(`
                    INSERT INTO PayOSTransactions (userId, amount, orderId, paymentId, status, paymentUrl, createdAt)
                    VALUES (@userId, @amount, @orderId, @paymentId, @status, @paymentUrl, GETDATE())
                `);

            // 2. CỘNG TIỀN VÀO VÍ
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('amount', sql.Decimal(12, 2), amount)
                .query(`
                    UPDATE Wallets 
                    SET balance = balance + @amount, updatedAt = GETDATE()
                    WHERE userId = @userId
                `);

            // 3. LẤY WALLET_ID
            const walletResult = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`SELECT id FROM Wallets WHERE userId = @userId`);

            const walletId = walletResult.recordset[0]?.id;

            // 4. THÊM VÀO BẢNG TRANSACTIONS (dùng walletId)
            if (walletId) {
                await pool.request()
                    .input('walletId', sql.Int, walletId)
                    .input('amount', sql.Decimal(12, 2), amount)
                    .input('type', sql.VarChar(20), 'TOPUP')
                    .input('status', sql.VarChar(20), 'SUCCESS')
                    .input('description', sql.NVarChar, `Nạp tiền qua PayOS - Mã: ${orderCode}`)
                    .query(`
                        INSERT INTO Transactions (walletId, amount, type, status, description, createdAt)
                        VALUES (@walletId, @amount, @type, @status, @description, GETDATE())
                    `);
                console.log(`✅ Transaction record added for wallet ${walletId}`);
            }

            // 5. CẬP NHẬT TRẠNG THÁI GIAO DỊCH PAYOS
            await pool.request()
                .input('orderId', sql.NVarChar, orderCode.toString())
                .input('status', sql.VarChar(20), 'SUCCESS')
                .query(`
                    UPDATE PayOSTransactions 
                    SET status = @status, paidAt = GETDATE()
                    WHERE orderId = @orderId
                `);

            console.log(`✅ Added ${amount} to wallet user ${userId} immediately`);

            res.json({
                success: true,
                paymentUrl: response.data.data.checkoutUrl,
                orderId: orderCode,
                balanceUpdated: true
            });
        } else {
            res.status(400).json({
                success: false,
                message: response.data.desc || "Tạo thanh toán thất bại"
            });
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
// BackEnd/controllers/payos.controller.js
exports.payosReturn = async (req, res) => {
    try {
        console.log("=== PAYOS RETURN CALLED ===");
        console.log("Query params:", req.query);

        const { orderCode, status, code } = req.query;

        console.log(`OrderCode: ${orderCode}, Status: ${status}, Code: ${code}`);

        if (code === '00' || status === 'PAID') {
            console.log("✅ Payment successful, updating wallet...");

            const pool = await poolPromise;

            // Tìm giao dịch
            const transResult = await pool.request()
                .input('orderId', sql.NVarChar, orderCode)
                .query(`
                    SELECT * FROM PayOSTransactions 
                    WHERE orderId = @orderId
                `);

            console.log("Transaction found:", transResult.recordset);

            if (transResult.recordset.length > 0) {
                const transaction = transResult.recordset[0];
                console.log(`Transaction: UserId=${transaction.userId}, Amount=${transaction.amount}`);

                if (transaction.status !== 'SUCCESS') {
                    // 1. Cộng tiền vào ví
                    await pool.request()
                        .input('userId', sql.Int, transaction.userId)
                        .input('amount', sql.Decimal(12, 2), transaction.amount)
                        .query(`
                            UPDATE Wallets 
                            SET balance = balance + @amount, updatedAt = GETDATE()
                            WHERE userId = @userId
                        `);

                    // 2. Lấy walletId
                    const walletResult = await pool.request()
                        .input('userId', sql.Int, transaction.userId)
                        .query(`SELECT id FROM Wallets WHERE userId = @userId`);

                    const walletId = walletResult.recordset[0]?.id;

                    // 3. Thêm vào bảng Transactions (dùng walletId)
                    if (walletId) {
                        await pool.request()
                            .input('walletId', sql.Int, walletId)
                            .input('amount', sql.Decimal(12, 2), transaction.amount)
                            .input('type', sql.VarChar(20), 'TOPUP')
                            .input('status', sql.VarChar(20), 'SUCCESS')
                            .input('description', sql.NVarChar, `Nạp tiền qua PayOS - Mã: ${orderCode}`)
                            .query(`
                                INSERT INTO Transactions (walletId, amount, type, status, description, createdAt)
                                VALUES (@walletId, @amount, @type, @status, @description, GETDATE())
                            `);
                        console.log(`✅ Transaction record added for wallet ${walletId}`);
                    }

                    // 4. Cập nhật trạng thái giao dịch PayOS
                    await pool.request()
                        .input('orderId', sql.NVarChar, orderCode)
                        .input('status', sql.VarChar(20), 'SUCCESS')
                        .query(`
                            UPDATE PayOSTransactions 
                            SET status = @status, paidAt = GETDATE()
                            WHERE orderId = @orderId
                        `);

                    // 5. Kiểm tra số dư mới
                    const newBalance = await pool.request()
                        .input('userId', sql.Int, transaction.userId)
                        .query(`SELECT balance FROM Wallets WHERE userId = @userId`);

                    console.log(`✅ Added ${transaction.amount} to wallet user ${transaction.userId}`);
                    console.log(`New balance: ${newBalance.recordset[0]?.balance}`);
                } else {
                    console.log("Transaction already processed");
                }
            } else {
                console.log(`❌ Transaction not found for orderId: ${orderCode}`);
            }

            res.redirect(`${process.env.FRONTEND_URL}/vi/nap-tien/success?orderId=${orderCode}`);
        } else {
            console.log("❌ Payment not successful");
            res.redirect(`${process.env.FRONTEND_URL}/vi/nap-tien?error=failed`);
        }

    } catch (err) {
        console.error("Return error:", err);
        res.redirect(`${process.env.FRONTEND_URL}/vi/nap-tien?error=server_error`);
    }
};
// Webhook nhận kết quả thanh toán
exports.payosWebhook = async (req, res) => {
    try {
        console.log("=== PAYOS WEBHOOK RECEIVED ===");
        console.log("Webhook data:", req.body);

        const webhookData = req.body;

        // Kiểm tra dữ liệu webhook
        if (webhookData.code === '00' && webhookData.data?.status === 'PAID') {
            const orderCode = webhookData.data.orderCode;
            const paymentLinkId = webhookData.data.paymentLinkId;

            const pool = await poolPromise;

            // Tìm giao dịch
            const transResult = await pool.request()
                .input('orderId', sql.NVarChar, orderCode.toString())
                .query(`
                    SELECT * FROM PayOSTransactions 
                    WHERE orderId = @orderId AND status = 'PENDING'
                `);

            if (transResult.recordset.length > 0) {
                const transaction = transResult.recordset[0];

                // Cập nhật trạng thái giao dịch
                await pool.request()
                    .input('orderId', sql.NVarChar, orderCode.toString())
                    .input('status', sql.VarChar(20), 'SUCCESS')
                    .input('paymentId', sql.NVarChar, paymentLinkId)
                    .query(`
                        UPDATE PayOSTransactions 
                        SET status = @status, 
                            paymentId = @paymentId,
                            paidAt = GETDATE()
                        WHERE orderId = @orderId
                    `);

                // Cộng tiền vào ví
                await pool.request()
                    .input('userId', sql.Int, transaction.userId)
                    .input('amount', sql.Decimal(12, 2), transaction.amount)
                    .query(`
                        UPDATE Wallets 
                        SET balance = balance + @amount, updatedAt = GETDATE()
                        WHERE userId = @userId
                    `);

                // Tạo transaction record
                await pool.request()
                    .input('userId', sql.Int, transaction.userId)
                    .input('amount', sql.Decimal(12, 2), transaction.amount)
                    .input('type', sql.VarChar(20), 'TOPUP')
                    .input('status', sql.VarChar(20), 'SUCCESS')
                    .input('description', sql.NVarChar, `Nạp tiền qua PayOS - Mã: ${orderCode}`)
                    .query(`
                        INSERT INTO Transactions (userId, amount, type, status, description, createdAt)
                        VALUES (@userId, @amount, @type, @status, @description, GETDATE())
                    `);

                console.log(`✅ Added ${transaction.amount} to wallet user ${transaction.userId}`);
            }
        }

        res.status(200).json({ success: true });

    } catch (err) {
        console.error("❌ Webhook error:", err);
        res.status(200).json({ success: true });
    }
};

// Return URL - sau khi thanh toán thành công

// Kiểm tra trạng thái thanh toán
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('orderId', sql.NVarChar, orderId)
            .query(`
                SELECT * FROM PayOSTransactions 
                WHERE orderId = @orderId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        res.json({
            success: true,
            data: result.recordset[0]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/wallet/deposit-history
exports.getDepositHistory = async (req, res) => {
    try {
        const userId = req.user.id; // lấy từ middleware auth

        const pool = await poolPromise;
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT 
                    id,
                    amount,
                    orderId,
                    paymentId,
                    status,
                    paymentUrl,
                    paidAt,
                    createdAt
                FROM PayOSTransactions
                WHERE userId = @userId
                ORDER BY createdAt DESC
            `);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error("getDepositHistory error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = exports;