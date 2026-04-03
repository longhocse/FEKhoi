// Định dạng tiền tệ
export const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount).replace('₫', 'VND').trim();
};

// Định dạng ngày tháng
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Định dạng số điện thoại
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
};

// Lấy màu sắc theo loại giao dịch
export const getTransactionColor = (type) => {
    const colors = {
        TOPUP: 'green',
        PAYMENT: 'blue',
        REFUND: 'orange',
        WITHDRAW: 'red'
    };
    return colors[type] || 'gray';
};

// Lấy text theo loại giao dịch
export const getTransactionTypeText = (type) => {
    const texts = {
        TOPUP: 'Nạp tiền',
        PAYMENT: 'Thanh toán',
        REFUND: 'Hoàn tiền',
        WITHDRAW: 'Rút tiền'
    };
    return texts[type] || type;
};

// Lấy text theo trạng thái
export const getTransactionStatusText = (status) => {
    const texts = {
        PENDING: 'Chờ xử lý',
        SUCCESS: 'Thành công',
        FAILED: 'Thất bại'
    };
    return texts[status] || status;
};

// Lấy màu theo trạng thái
export const getTransactionStatusColor = (status) => {
    const colors = {
        PENDING: 'orange',
        SUCCESS: 'green',
        FAILED: 'red'
    };
    return colors[status] || 'gray';
};