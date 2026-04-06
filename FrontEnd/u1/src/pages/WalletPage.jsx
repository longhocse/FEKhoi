import React, { useState, useEffect } from 'react';
import WalletBalance from '../components/wallet/WalletBalance';
import WalletTransactions from '../components/wallet/WalletTransactions';
import TopUpModal from '../components/wallet/TopUpModal';
import WithdrawModal from '../components/wallet/WithdrawModal';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import walletService from '../services/walletService';

const WalletPage = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const walletData = await walletService.getMyWallet();
            setWallet(walletData.data);

            const transData = await walletService.getTransactions({ limit: 20 });
            setTransactions(transData.data);
            setHasMore(transData.data.length === 20);
            setError(null);
        } catch (err) {
            setError(err.message || 'Không thể tải thông tin ví');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const loadMoreTransactions = async () => {
        try {
            const nextPage = page + 1;
            const data = await walletService.getTransactions({ limit: 20, page: nextPage });

            if (data.data.length > 0) {
                setTransactions(prev => [...prev, ...data.data]);
                setPage(nextPage);
                setHasMore(data.data.length === 20);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Lỗi tải thêm giao dịch:', err);
        }
    };

    const handleTopUp = async (amount, description, paymentMethod) => {
        try {
            setActionLoading(true);
            const result = await walletService.topUp(amount, description, paymentMethod);

            // Cập nhật số dư mới
            setWallet(prev => ({
                ...prev,
                balance: result.data.wallet.balance
            }));

            // Thêm giao dịch mới vào đầu danh sách
            setTransactions(prev => [result.data.transaction, ...prev]);

            setShowTopUpModal(false);
            alert('Nạp tiền thành công!');
        } catch (err) {
            alert(err.message || 'Nạp tiền thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handleWithdraw = async (amount, bankInfo, description) => {
        try {
            setActionLoading(true);
            const result = await walletService.withdraw(amount, bankInfo, description);

            // Cập nhật số dư mới
            setWallet(prev => ({
                ...prev,
                balance: result.data.wallet.balance
            }));

            // Thêm giao dịch mới vào đầu danh sách
            setTransactions(prev => [result.data.transaction, ...prev]);

            setShowWithdrawModal(false);
            alert('Yêu cầu rút tiền đã được gửi!');
        } catch (err) {
            alert(err.message || 'Rút tiền thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !wallet) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Ví điện tử</h1>

            {error && (
                <ErrorMessage message={error} onRetry={fetchWalletData} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <WalletBalance
                        wallet={wallet}
                        onTopUp={() => setShowTopUpModal(true)}
                        onWithdraw={() => setShowWithdrawModal(true)}
                    />

                    {/* Thông tin thêm */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Thông tin ví</h3>
                        <div className="space-y-2 text-sm">
                            <p className="flex justify-between">
                                <span className="text-gray-600">Mã ví:</span>
                                <span className="font-mono">{wallet?.id}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Loại tiền:</span>
                                <span>{wallet?.currency}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Ngày tạo:</span>
                                <span>{new Date(wallet?.createdAt).toLocaleDateString('vi-VN')}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Trạng thái:</span>
                                <span className={wallet?.isLocked ? 'text-red-600' : 'text-green-600'}>
                                    {wallet?.isLocked ? 'Đã khóa' : 'Hoạt động'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <WalletTransactions
                        transactions={transactions}
                        loading={loading}
                        onLoadMore={loadMoreTransactions}
                        hasMore={hasMore}
                    />
                </div>
            </div>

            {/* Modals */}
            <TopUpModal
                isOpen={showTopUpModal}
                onClose={() => setShowTopUpModal(false)}
                onConfirm={handleTopUp}
                loading={actionLoading}
            />

            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onConfirm={handleWithdraw}
                loading={actionLoading}
                maxAmount={wallet?.balance || 0}
            />
        </div>
    );
};

export default WalletPage;