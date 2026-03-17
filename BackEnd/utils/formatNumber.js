// Định dạng số tiền
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Định dạng ngày tháng
const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
};

// Định dạng số điện thoại
const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
};

module.exports = {
    formatCurrency,
    formatDate,
    formatPhoneNumber
};