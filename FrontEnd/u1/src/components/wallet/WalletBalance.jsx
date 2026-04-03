import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const WalletBalance = ({ wallet, onTopUp, onWithdraw }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Ví của tôi</h2>
                {wallet?.isLocked && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Đã khóa
                    </span>
                )}
            </div>

            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Số dư khả dụng</p>
                <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(wallet?.balance || 0)}
                </p>
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={onTopUp}
                    disabled={wallet?.isLocked}
                    className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ${wallet?.isLocked ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    Nạp tiền
                </button>
                <button
                    onClick={onWithdraw}
                    disabled={wallet?.isLocked}
                    className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ${wallet?.isLocked ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    Rút tiền
                </button>
            </div>
        </div>
    );
};

export default WalletBalance;