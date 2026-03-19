import React from 'react';
import {
    formatCurrency,
    formatDate,
    getTransactionTypeText,
    getTransactionStatusText,
    getTransactionColor,
    getTransactionStatusColor
} from '../../utils/formatters';

const TransactionItem = ({ transaction }) => {
    const typeColor = getTransactionColor(transaction.type);
    const statusColor = getTransactionStatusColor(transaction.status);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'TOPUP': return '💰';
            case 'PAYMENT': return '💳';
            case 'REFUND': return '↩️';
            case 'WITHDRAW': return '🏦';
            default: return '💱';
        }
    };

    return (
        <div className="border-b border-gray-200 py-4 hover:bg-gray-50 transition duration-150">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <div className={`text-2xl`}>{getTypeIcon(transaction.type)}</div>
                    <div>
                        <p className="font-medium text-gray-800">
                            {getTransactionTypeText(transaction.type)}
                        </p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                                {formatDate(transaction.createdAt)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                                {getTransactionStatusText(transaction.status)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`text-right font-semibold ${transaction.type === 'TOPUP' || transaction.type === 'REFUND'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {transaction.type === 'TOPUP' || transaction.type === 'REFUND' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                </div>
            </div>
        </div>
    );
};

export default TransactionItem;