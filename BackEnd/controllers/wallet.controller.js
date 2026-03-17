const sql = require('mssql');
const { poolPromise } = require('../config/db');
const Wallet = require('../models/walletModel');

const walletController = {
    // Lấy thông tin ví của user hiện tại
    getMyWallet: async (req, res) => {
        try {
            console.log('📌 getMyWallet - userId:', req.user.id);

            const userId = req.user.id;
            let wallet = await Wallet.getByUserId(userId);

            if (!wallet) {
                console.log('📌 Chưa có ví, tạo mới cho user:', userId);
                wallet = await Wallet.create(userId);
            }

            console.log('📌 Wallet found:', wallet);

            res.json({
                success: true,
                data: wallet
            });
        } catch (error) {
            console.error('❌ Lỗi getMyWallet:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Nạp tiền vào ví
    topUp: async (req, res) => {
        try {
            console.log('📌 topUp - userId:', req.user.id);

            const userId = req.user.id;
            const { amount, description } = req.body;

            if (!amount || amount < 10000) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền nạp tối thiểu 10,000 VND'
                });
            }

            const wallet = await Wallet.getByUserId(userId);

            if (!wallet) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ví'
                });
            }

            if (wallet.isLocked) {
                return res.status(400).json({
                    success: false,
                    message: 'Ví đang bị khóa'
                });
            }

            const result = await Wallet.topUp(
                wallet.id,
                amount,
                description || `Nạp ${amount.toLocaleString()} VND vào ví`
            );

            res.json({
                success: true,
                data: result.wallet,
                message: 'Nạp tiền thành công'
            });
        } catch (error) {
            console.error('❌ Lỗi topUp:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Thanh toán bằng ví
    pay: async (req, res) => {
        try {
            console.log('📌 pay - userId:', req.user.id);

            const userId = req.user.id;
            const { amount, description, referenceId } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền không hợp lệ'
                });
            }

            const wallet = await Wallet.getByUserId(userId);

            if (!wallet) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ví'
                });
            }

            if (wallet.isLocked) {
                return res.status(400).json({
                    success: false,
                    message: 'Ví đang bị khóa'
                });
            }

            const result = await Wallet.pay(
                wallet.id,
                amount,
                description || `Thanh toán ${amount.toLocaleString()} VND`,
                referenceId
            );

            res.json({
                success: true,
                data: result.wallet,
                message: 'Thanh toán thành công'
            });
        } catch (error) {
            console.error('❌ Lỗi pay:', error);
            if (error.message === 'Số dư không đủ') {
                return res.status(400).json({
                    success: false,
                    message: 'Số dư không đủ'
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Rút tiền từ ví
    withdraw: async (req, res) => {
        try {
            console.log('📌 withdraw - userId:', req.user.id);

            const userId = req.user.id;
            const { amount, description, bankInfo } = req.body;

            if (!amount || amount < 50000) {
                return res.status(400).json({
                    success: false,
                    message: 'Số tiền rút tối thiểu 50,000 VND'
                });
            }

            if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Thông tin ngân hàng không hợp lệ'
                });
            }

            const wallet = await Wallet.getByUserId(userId);

            if (!wallet) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ví'
                });
            }

            if (wallet.isLocked) {
                return res.status(400).json({
                    success: false,
                    message: 'Ví đang bị khóa'
                });
            }

            const result = await Wallet.withdraw(
                wallet.id,
                amount,
                description || `Rút ${amount.toLocaleString()} VND`,
                bankInfo
            );

            res.json({
                success: true,
                data: result.wallet,
                message: 'Yêu cầu rút tiền đã được gửi'
            });
        } catch (error) {
            console.error('❌ Lỗi withdraw:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy lịch sử giao dịch
    getTransactionHistory: async (req, res) => {
        try {
            console.log('📌 getTransactionHistory - userId:', req.user.id);

            const userId = req.user.id;
            const { limit = 20, page = 1, type, status } = req.query;

            const wallet = await Wallet.getByUserId(userId);

            if (!wallet) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const filters = {
                type,
                status,
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            const transactions = await Wallet.getTransactions(wallet.id, filters);

            res.json({
                success: true,
                data: transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('❌ Lỗi getTransactionHistory:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy chi tiết giao dịch
    getTransactionDetail: async (req, res) => {
        try {
            console.log('📌 getTransactionDetail - userId:', req.user.id);

            const userId = req.user.id;
            const { transactionId } = req.params;

            const wallet = await Wallet.getByUserId(userId);

            if (!wallet) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ví'
                });
            }

            const transactions = await Wallet.getTransactions(wallet.id, {
                limit: 100
            });

            const transaction = transactions.find(t => t.id == transactionId);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy giao dịch'
                });
            }

            res.json({
                success: true,
                data: transaction
            });
        } catch (error) {
            console.error('❌ Lỗi getTransactionDetail:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // ===== ADMIN ROUTES =====

    // Lấy tất cả ví (admin)
    getAllWallets: async (req, res) => {
        try {
            console.log('📌 getAllWallets - admin');

            const { role, isLocked, search, limit = 50, page = 1 } = req.query;

            const filters = {
                role,
                isLocked: isLocked !== undefined ? isLocked === 'true' : undefined,
                search,
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            const wallets = await Wallet.getAll(filters);

            res.json({
                success: true,
                data: wallets,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('❌ Lỗi getAllWallets:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy tổng quan ví (admin)
    getWalletSummary: async (req, res) => {
        try {
            console.log('📌 getWalletSummary - admin');

            const summary = await Wallet.getSummary();

            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            console.error('❌ Lỗi getWalletSummary:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Khóa/mở khóa ví (admin)
    toggleWalletLock: async (req, res) => {
        try {
            console.log('📌 toggleWalletLock - admin');

            const { walletId } = req.params;
            const { isLocked, reason } = req.body;

            const updatedWallet = await Wallet.toggleLock(walletId, isLocked, reason);

            res.json({
                success: true,
                data: updatedWallet,
                message: isLocked ? 'Đã khóa ví' : 'Đã mở khóa ví'
            });
        } catch (error) {
            console.error('❌ Lỗi toggleWalletLock:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy chi tiết ví theo userId (admin)
    getWalletByUserId: async (req, res) => {
        try {
            console.log('📌 getWalletByUserId - admin');

            const { userId } = req.params;
            const wallet = await Wallet.getByUserId(userId);

            if (!wallet) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ví'
                });
            }

            res.json({
                success: true,
                data: wallet
            });
        } catch (error) {
            console.error('❌ Lỗi getWalletByUserId:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy danh sách yêu cầu rút tiền (admin) - GIỮ NGUYÊN
    getWithdrawRequests: async (req, res) => {
        try {
            console.log('📌 getWithdrawRequests - admin');

            const pool = await poolPromise;
            const { status = 'PENDING', limit = 50, page = 1 } = req.query;

            const result = await pool.request()
                .input('status', sql.VarChar(20), status)
                .input('offset', sql.Int, (parseInt(page) - 1) * parseInt(limit))
                .input('limit', sql.Int, parseInt(limit))
                .query(`
                    SELECT t.*, w.userId, u.name as userName, u.email, u.phoneNumber,
                        w.balance as walletBalance
                    FROM Transactions t
                    JOIN Wallets w ON t.walletId = w.id
                    JOIN Users u ON w.userId = u.id
                    WHERE t.type = 'WITHDRAW' AND t.status = @status
                    ORDER BY t.createdAt ASC
                    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
                `);

            res.json({
                success: true,
                data: result.recordset,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('❌ Lỗi getWithdrawRequests:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xử lý yêu cầu rút tiền (admin) - COMMENT TẠM THỜI
    // processWithdraw: async (req, res) => {
    //     try {
    //         console.log('📌 processWithdraw - admin');

    //         const { transactionId } = req.params;
    //         const { status, adminNote } = req.body;

    //         // Tạm thời chưa xử lý
    //         res.json({
    //             success: true,
    //             message: 'Tính năng đang phát triển'
    //         });
    //     } catch (error) {
    //         console.error('❌ Lỗi processWithdraw:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: error.message
    //         });
    //     }
    // }
};

module.exports = walletController;