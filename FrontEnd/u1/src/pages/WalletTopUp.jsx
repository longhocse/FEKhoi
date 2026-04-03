// src/pages/WalletTopUp.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWallet } from '../context/WalletProvider';

export default function WalletTopUp() {
    const navigate = useNavigate();
    const { fetchWallet } = useWallet();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const numAmount = parseInt(amount);
        if (!amount || numAmount < 10000) {
            setError('Số tiền nạp tối thiểu là 10,000 VND');
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                `${API_URL}/wallets/topup`,
                { amount: numAmount, description: 'Nạp tiền' },
                { headers: getHeaders() }
            );

            setSuccess('Nạp tiền thành công!');
            await fetchWallet();

            setTimeout(() => {
                navigate('/wallet');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Nạp tiền thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <h4 className="mb-0">
                                <i className="bi bi-plus-circle me-2 text-primary"></i>
                                Nạp tiền vào ví
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError('')}>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success">
                                    {success} Đang chuyển hướng...
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Số tiền nạp</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Nhập số tiền"
                                        min="10000"
                                        step="10000"
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Số tiền nạp tối thiểu: 10,000 VND
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={loading}
                                        className="flex-grow-1"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Xác nhận nạp tiền'
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => navigate('/wallet')}
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}