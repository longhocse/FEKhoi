import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const WithdrawModal = ({ isOpen, onClose, onConfirm, loading, maxAmount }) => {
    const [amount, setAmount] = useState('');
    const [bankInfo, setBankInfo] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (amount && parseInt(amount) >= 50000 && parseInt(amount) <= maxAmount) {
            onConfirm(parseInt(amount), bankInfo, description);
        }
    };

    const handleBankInfoChange = (field, value) => {
        setBankInfo(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Rút tiền từ ví</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số tiền cần rút
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="50000"
                            max={maxAmount}
                            step="10000"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Số dư khả dụng: {formatCurrency(maxAmount)}<br />
                            Số tiền rút tối thiểu: 50,000 VND
                        </p>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Thông tin tài khoản nhận
                        </h3>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={bankInfo.bankName}
                                onChange={(e) => handleBankInfoChange('bankName', e.target.value)}
                                placeholder="Tên ngân hàng"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <input
                                type="text"
                                value={bankInfo.accountNumber}
                                onChange={(e) => handleBankInfoChange('accountNumber', e.target.value)}
                                placeholder="Số tài khoản"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <input
                                type="text"
                                value={bankInfo.accountName}
                                onChange={(e) => handleBankInfoChange('accountName', e.target.value)}
                                placeholder="Tên chủ tài khoản"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú (không bắt buộc)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="2"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập ghi chú nếu có..."
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={loading || !amount || parseInt(amount) < 50000 || parseInt(amount) > maxAmount}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawModal;