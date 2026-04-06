// src/context/WalletProvider.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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
    const { user, isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState([]);

    const fetchDepositHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/payos/deposit-history`, {
                headers: getHeaders()
            });

            if (res.data.success) {
                setTransactions(res.data.data || []);
            }
        } catch (err) {
            console.error("fetchDepositHistory error:", err);
            setTransactions([]);
        }
    };

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchWallet = async () => {
        if (!isAuthenticated) {
            setWallet(null);
            setBalance(0);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/wallets/me`, {
                headers: getHeaders()
            });

            if (response.data.success) {
                console.log('✅ Wallet loaded:', response.data.data);
                setWallet(response.data.data);
                setBalance(response.data.data.balance || 0);
            }
        } catch (error) {
            console.error('❌ Lỗi lấy ví:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchWallet();
        }
    }, [isAuthenticated]);

    const topUp = async (amount, description = '') => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${API_URL}/wallets/topup`,
                { amount, description },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                setBalance(response.data.data.balance);
                await fetchWallet();
                return response.data;
            }
        } catch (error) {
            throw error.response?.data || error.message;
        } finally {
            setLoading(false);
        }
    };

    const refreshWallet = fetchWallet;

    const value = {
        wallet,
        balance,
        loading,
        transactions,
        fetchWallet,
        refreshWallet,
        topUp,
        fetchDepositHistory
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};