// src/pages/admin/AdminWalletManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

export default function AdminWalletManagement() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/wallets/admin/all`, {
                headers: getHeaders()
            });
            setWallets(response.data.data || []);
        } catch (error) {
            console.error('Lỗi tải danh sách ví:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLock = async (walletId, currentLocked) => {
        try {
            await axios.put(
                `${API_URL}/wallets/admin/${walletId}/toggle-lock`,
                { isLocked: !currentLocked },
                { headers: getHeaders() }
            );
            fetchWallets();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-wallet2 me-2"></i>
                Quản lý ví điện tử
            </h2>

            <Card className="shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Người dùng</th>
                                    <th>Email</th>
                                    <th>Số dư</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets.map(wallet => (
                                    <tr key={wallet.id}>
                                        <td>{wallet.id}</td>
                                        <td>{wallet.userName}</td>
                                        <td>{wallet.email}</td>
                                        <td className="fw-bold">{formatCurrency(wallet.balance)}</td>
                                        <td>
                                            <Badge bg={wallet.isLocked ? 'danger' : 'success'}>
                                                {wallet.isLocked ? 'Đã khóa' : 'Hoạt động'}
                                            </Badge>
                                        </td>
                                        <td>{new Date(wallet.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant={wallet.isLocked ? 'success' : 'warning'}
                                                onClick={() => toggleLock(wallet.id, wallet.isLocked)}
                                            >
                                                {wallet.isLocked ? 'Mở khóa' : 'Khóa'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}