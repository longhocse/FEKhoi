import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const refundService = {
    getToken: () => {
        return localStorage.getItem('token');
    },

    getHeaders: () => {
        const token = refundService.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // Tạo yêu cầu hoàn tiền
    requestRefund: async (ticketId, reason) => {
        try {
            const response = await axios.post(
                `${API_URL}/refunds/request`,
                { ticketId, reason },
                { headers: refundService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy danh sách yêu cầu hoàn tiền của user
    getMyRefunds: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/refunds/my-refunds`,
                { headers: refundService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy chi tiết yêu cầu hoàn tiền
    getRefundDetail: async (refundId) => {
        try {
            const response = await axios.get(
                `${API_URL}/refunds/${refundId}`,
                { headers: refundService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ===== ADMIN =====
    // Lấy tất cả yêu cầu hoàn tiền
    getAllRefunds: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await axios.get(
                `${API_URL}/refunds/admin/all?${params}`,
                { headers: refundService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Xử lý yêu cầu hoàn tiền (admin)
    processRefund: async (refundId, status, adminNote) => {
        try {
            const response = await axios.put(
                `${API_URL}/refunds/admin/${refundId}/process`,
                { status, adminNote },
                { headers: refundService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Thống kê hoàn tiền (admin)
    getRefundStatistics: async () => {
        try {
            const response = await axios.get(
                `${API_URL}/refunds/admin/statistics`,
                { headers: refundService.getHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default refundService;