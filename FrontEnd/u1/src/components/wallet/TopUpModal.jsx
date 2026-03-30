import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const TopUpModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANKING');
    const [description, setDescription] = useState('');

    const presetAmounts = [100000, 200000, 500000, 1000000, 2000000, 5000000];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (amount && parseInt(amount) >= 10000) {
            onConfirm(parseInt(amount), description, paymentMethod);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Nạp tiền vào ví</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn số tiền
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {presetAmounts.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAmount(preset.toString())}
                                    className="border border-gray-300 rounded-lg py-2 text-sm hover:bg-blue-50 hover:border-blue-500 transition"
                                >
                                    {formatCurrency(preset)}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Hoặc nhập số tiền"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="10000"
                            step="10000"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Số tiền nạp tối thiểu: 10,000 VND
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phương thức thanh toán
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="BANKING">Chuyển khoản ngân hàng</option>
                            <option value="MOMO">Ví MoMo</option>
                            <option value="ZALOPAY">ZaloPay</option>
                            <option value="VNPAY">VNPay</option>
                        </select>
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
                            disabled={loading || !amount || parseInt(amount) < 10000}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
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

export default TopUpModal;