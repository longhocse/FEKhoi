import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const walletService = {
    // Lấy token từ localStorage
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Tạo header với token
    getHeaders: () => {
        const token = walletService.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // Lấy thông tin ví
    getMyWallet: async () => {
        try {
            const response = await axios.get(`${API_URL}/wallets/me`, {
                headers: walletService.getHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Nạp tiền
    topUp: async (amount, description = '', paymentMethod = 'BANKING') => {
        try {
            const response = await axios.post(
                `${API_URL}/wallets/topup`,
                { amount, description, paymentMethod },
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Thanh toán
    pay: async (amount, description = '', referenceId = '') => {
        try {
            const response = await axios.post(
                `${API_URL}/wallets/pay`,
                { amount, description, referenceId },
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Rút tiền
    withdraw: async (amount, bankInfo, description = '') => {
        try {
            const response = await axios.post(
                `${API_URL}/wallets/withdraw`,
                { amount, bankInfo, description },
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy lịch sử giao dịch
    getTransactions: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await axios.get(
                `${API_URL}/wallets/transactions?${params}`,
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy chi tiết giao dịch
    getTransactionDetail: async (transactionId) => {
        try {
            const response = await axios.get(
                `${API_URL}/wallets/transactions/${transactionId}`,
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ============= ADMIN SERVICES =============

    // Admin: Lấy tất cả ví
    getAllWallets: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await axios.get(
                `${API_URL}/wallets/admin/all?${params}`,
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin: Lấy tổng quan
    getWalletSummary: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/wallets/admin/summary`,
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin: Lấy danh sách yêu cầu rút tiền
    getWithdrawRequests: async (status = 'PENDING') => {
        try {
            const response = await axios.get(
                `${API_URL}/wallets/admin/withdraw-requests?status=${status}`,
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin: Xử lý rút tiền
    processWithdraw: async (transactionId, status, adminNote) => {
        try {
            const response = await axios.put(
                `${API_URL}/wallets/admin/withdraw/${transactionId}/process`,
                { status, adminNote },
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin: Khóa/Mở khóa ví
    toggleWalletLock: async (walletId, isLocked, reason) => {
        try {
            const response = await axios.put(
                `${API_URL}/wallets/admin/${walletId}/toggle-lock`,
                { isLocked, reason },
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin: Điều chỉnh số dư
    adjustBalance: async (walletId, amount, type, reason) => {
        try {
            const response = await axios.post(
                `${API_URL}/wallets/admin/${walletId}/adjust-balance`,
                { amount, type, reason },
                { headers: walletService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default walletService;