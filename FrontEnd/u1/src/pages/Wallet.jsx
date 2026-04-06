// src/pages/Wallet.jsx
import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletProvider';

export default function Wallet() {
    const navigate = useNavigate();
    const { wallet, balance, loading, fetchWallet, transactions, fetchDepositHistory } = useWallet();


    useEffect(() => {
        fetchWallet();
        fetchDepositHistory();
    }, []);

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

            <Row className="justify-content-center">
                <Col md={6}>
                    {/* Wallet Balance */}
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
                                    onClick={fetchWallet}
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Làm mới
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Wallet Info */}
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
                    {/* Deposit History */}
                    <Card className="shadow-sm mt-4">
                        <Card.Body>
                            <h6 className="mb-3">
                                <i className="bi bi-clock-history me-2"></i>
                                Lịch sử nạp tiền
                            </h6>

                            {transactions.length === 0 ? (
                                <p className="text-muted text-center mb-0">
                                    Chưa có giao dịch nào
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Số tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td>{tx.orderId}</td>

                                                    <td className="fw-bold text-primary">
                                                        {formatCurrency(tx.amount)}
                                                    </td>

                                                    <td>
                                                        <Badge bg={
                                                            tx.status === "PAID"
                                                                ? "success"
                                                                : tx.status === "PENDING"
                                                                    ? "warning"
                                                                    : "danger"
                                                        }>
                                                            {tx.status}
                                                        </Badge>
                                                    </td>

                                                    <td>
                                                        {formatDate(tx.paidAt || tx.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}