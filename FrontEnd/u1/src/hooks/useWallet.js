import { useState, useEffect } from 'react';
import walletService from '../services/walletService';

export const useWallet = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            setLoading(true);
            const data = await walletService.getMyWallet();
            setWallet(data.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const topUp = async (amount, description, paymentMethod) => {
        try {
            const result = await walletService.topUp(amount, description, paymentMethod);
            setWallet(result.data.wallet);
            return result;
        } catch (err) {
            throw err;
        }
    };

    const pay = async (amount, description, referenceId) => {
        try {
            const result = await walletService.pay(amount, description, referenceId);
            setWallet(result.data.wallet);
            return result;
        } catch (err) {
            throw err;
        }
    };

    return {
        wallet,
        loading,
        error,
        refresh: fetchWallet,
        topUp,
        pay
    };
};