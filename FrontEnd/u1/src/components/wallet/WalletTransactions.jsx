import React, { useState } from 'react';
import TransactionItem from './TransactionItem';
import LoadingSpinner from '../common/LoadingSpinner';

const WalletTransactions = ({ transactions, loading, onLoadMore, hasMore }) => {
    const [filter, setFilter] = useState('ALL');

    const filterOptions = [
        { value: 'ALL', label: 'Tất cả' },
        { value: 'TOPUP', label: 'Nạp tiền' },
        { value: 'PAYMENT', label: 'Thanh toán' },
        { value: 'WITHDRAW', label: 'Rút tiền' }
    ];

    const filteredTransactions = filter === 'ALL'
        ? transactions
        : transactions.filter(t => t.type === filter);

    if (loading && transactions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Lịch sử giao dịch</h3>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {filteredTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                    Chưa có giao dịch nào
                </p>
            ) : (
                <div className="divide-y divide-gray-200">
                    {filteredTransactions.map(transaction => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="mt-4 text-center">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        {loading ? 'Đang tải...' : 'Xem thêm'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletTransactions;