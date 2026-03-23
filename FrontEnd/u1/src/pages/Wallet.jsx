// src/pages/Wallet.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletProvider';
import axios from 'axios'; // THÊM DÒNG NÀY

export default function Wallet() {
    const navigate = useNavigate();
    const { wallet, balance, loading, fetchWallet } = useWallet();
    const [transactions, setTransactions] = useState([]);
    const [loadingTrans, setLoadingTrans] = useState(false);
    const [error, setError] = useState('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await fetchWallet();
        await loadTransactions();
    };

    const loadTransactions = async () => {
        try {
            setLoadingTrans(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setTransactions([]);
                return;
            }

            const response = await axios.get(`${API_URL}/wallets/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setTransactions(response.data.data || []);
            } else {
                setTransactions([]);
            }
        } catch (err) {
            console.error('Lỗi tải giao dịch:', err);
            setError('Không thể tải lịch sử giao dịch');
        } finally {
            setLoadingTrans(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '0 đ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('₫', 'đ').trim();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const variants = {
            'SUCCESS': 'success',
            'PENDING': 'warning',
            'FAILED': 'danger'
        };
        const texts = {
            'SUCCESS': 'Thành công',
            'PENDING': 'Chờ xử lý',
            'FAILED': 'Thất bại'
        };
        return <Badge bg={variants[status] || 'secondary'}>{texts[status] || status}</Badge>;
    };

    const getTypeText = (type) => {
        const texts = {
            'TOPUP': 'Nạp tiền',
            'PAYMENT': 'Thanh toán',
            'WITHDRAW': 'Rút tiền',
            'REFUND': 'Hoàn tiền'
        };
        return texts[type] || type;
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải thông tin ví...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-wallet2 me-2"></i>
                Ví điện tử
            </h2>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Row>
                <Col md={4}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body className="text-center">
                            <div className="display-4 text-primary mb-3">
                                <i className="bi bi-wallet2"></i>
                            </div>
                            <h5 className="text-muted">Số dư khả dụng</h5>
                            <h2 className="text-primary fw-bold mb-3">
                                {formatCurrency(balance)}
                            </h2>

                            {wallet?.isLocked && (
                                <Badge bg="danger" className="mb-3 p-2">
                                    <i className="bi bi-lock me-1"></i>
                                    Ví đã bị khóa
                                </Badge>
                            )}

                            <div className="d-grid gap-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => navigate('/vi/nap-tien')}
                                    disabled={wallet?.isLocked}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Nạp tiền
                                </Button>

                                <Button
                                    variant="outline-primary"
                                    onClick={loadData}
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Làm mới
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <h6 className="mb-3">
                                <i className="bi bi-info-circle me-2"></i>
                                Thông tin ví
                            </h6>
                            <table className="table table-sm">
                                <tbody>
                                    <tr>
                                        <td>Mã ví:</td>
                                        <td className="text-end fw-bold">{wallet?.id}</td>
                                    </tr>
                                    <tr>
                                        <td>Loại tiền:</td>
                                        <td className="text-end">{wallet?.currency || 'VND'}</td>
                                    </tr>
                                    <tr>
                                        <td>Ngày tạo:</td>
                                        <td className="text-end">{formatDate(wallet?.createdAt)}</td>
                                    </tr>
                                    <tr>
                                        <td>Cập nhật:</td>
                                        <td className="text-end">{formatDate(wallet?.updatedAt)}</td>
                                    </tr>
                                    <tr>
                                        <td>Trạng thái:</td>
                                        <td className="text-end">
                                            <Badge bg={wallet?.isLocked ? 'danger' : 'success'}>
                                                {wallet?.isLocked ? 'Đã khóa' : 'Hoạt động'}
                                            </Badge>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-clock-history me-2"></i>
                                Lịch sử giao dịch
                            </h5>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={loadTransactions}
                                disabled={loadingTrans}
                            >
                                <i className="bi bi-arrow-repeat"></i>
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {loadingTrans ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" />
                                    <span className="ms-2">Đang tải...</span>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="bi bi-receipt fs-1 text-muted"></i>
                                    <p className="mt-3 text-muted">Chưa có giao dịch nào</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                <th>Loại</th>
                                                <th>Mô tả</th>
                                                <th className="text-end">Số tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(trans => (
                                                <tr key={trans.id}>
                                                    <td>
                                                        <i className={`bi ${trans.type === 'TOPUP' ? 'bi-arrow-down-circle text-success' :
                                                                trans.type === 'PAYMENT' ? 'bi-arrow-up-circle text-danger' :
                                                                    trans.type === 'WITHDRAW' ? 'bi-bank text-warning' :
                                                                        'bi-arrow-return-left text-info'
                                                            } me-2`}></i>
                                                        {getTypeText(trans.type)}
                                                    </td>
                                                    <td>{trans.description}</td>
                                                    <td className={`text-end fw-bold ${trans.type === 'TOPUP' || trans.type === 'REFUND'
                                                            ? 'text-success'
                                                            : 'text-danger'
                                                        }`}>
                                                        {trans.type === 'TOPUP' || trans.type === 'REFUND' ? '+' : '-'}
                                                        {formatCurrency(trans.amount)}
                                                    </td>
                                                    <td>{getStatusBadge(trans.status)}</td>
                                                    <td>{formatDate(trans.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}