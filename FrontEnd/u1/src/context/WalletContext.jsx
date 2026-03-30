import React, { createContext, useState, useContext, useEffect } from 'react';
import walletService from '../services/walletService';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshWallet = async () => {
        try {
            setLoading(true);
            const data = await walletService.getMyWallet();
            setWallet(data.data);
            setBalance(data.data.balance);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshWallet();
    }, []);

    const topUp = async (amount, description, paymentMethod) => {
        try {
            setLoading(true);
            const result = await walletService.topUp(amount, description, paymentMethod);
            setBalance(result.data.wallet.balance);
            return result;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const pay = async (amount, description, referenceId) => {
        try {
            setLoading(true);
            const result = await walletService.pay(amount, description, referenceId);
            setBalance(result.data.wallet.balance);
            return result;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        wallet,
        balance,
        loading,
        error,
        refreshWallet,
        topUp,
        pay
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};