// FrontEnd/u1/src/pages/WalletTopUp.jsx
import { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function WalletTopUp() {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    const amounts = [50000, 100000, 200000, 500000, 1000000];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const numAmount = parseInt(amount);
        if (isNaN(numAmount) || numAmount < 10000) {
            setError("Số tiền nạp tối thiểu 10,000đ");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/payos/create-payment",
                {
                    amount: numAmount,
                    description: description || `Nạp tiền vào ví BusGO`
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                window.location.href = response.data.paymentUrl;
            } else {
                setError(response.data.message || "Tạo thanh toán thất bại");
            }
        } catch (err) {
            console.error("Lỗi nạp tiền:", err);
            setError(err.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wallet-topup-page">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        {/* Header */}
                        <div className="text-center mb-5">
                            <div className="topup-icon mb-3">
                                <i className="bi bi-wallet2"></i>
                            </div>
                            <h1 className="fw-bold mb-2">
                                Nạp <span className="text-gradient">ví điện tử</span>
                            </h1>
                            <p className="text-muted">Nạp tiền ngay để đặt vé và nhận nhiều ưu đãi</p>
                        </div>

                        {/* Main Card */}
                        <Card className="topup-card border-0 shadow-lg rounded-4 overflow-hidden">
                            <Card.Body className="p-4 p-lg-5">
                                {error && (
                                    <Alert variant="danger" className="rounded-3 mb-4">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {/* Số tiền nạp */}
                                    <div className="mb-4">
                                        <Form.Label className="fw-semibold mb-3">
                                            <i className="bi bi-cash-stack me-2 text-primary"></i>
                                            Chọn số tiền nạp
                                        </Form.Label>
                                        <div className="amount-grid">
                                            {amounts.map(a => (
                                                <button
                                                    key={a}
                                                    type="button"
                                                    className={`amount-btn ${parseInt(amount) === a ? 'active' : ''}`}
                                                    onClick={() => setAmount(a.toString())}
                                                >
                                                    <span className="amount-value">{a.toLocaleString()}đ</span>
                                                    {parseInt(amount) === a && (
                                                        <i className="bi bi-check-circle-fill check-icon"></i>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-3 position-relative">
                                            <i className="bi bi-pencil-square position-absolute top-50 start-3 translate-middle-y text-muted"></i>
                                            <Form.Control
                                                type="number"
                                                placeholder="Nhập số tiền khác"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="custom-amount-input ps-5 py-3 rounded-3"
                                                min="10000"
                                                step="10000"
                                            />
                                        </div>
                                        <Form.Text className="text-muted">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Số tiền nạp tối thiểu 10,000đ
                                        </Form.Text>
                                    </div>

                                    {/* Nội dung chuyển khoản */}
                                    <div className="mb-4">
                                        <Form.Label className="fw-semibold mb-3">
                                            <i className="bi bi-chat-text me-2 text-primary"></i>
                                            Nội dung chuyển khoản (tuỳ chọn)
                                        </Form.Label>
                                        <div className="position-relative">
                                            <i className="bi bi-tag position-absolute top-50 start-3 translate-middle-y text-muted"></i>
                                            <Form.Control
                                                type="text"
                                                placeholder="VD: Nạp tiền vào ví BusGO"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="ps-5 py-3 rounded-3"
                                            />
                                        </div>
                                    </div>

                                    {/* Nút nạp tiền */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-100 py-3 rounded-3 fw-semibold btn-gradient mb-4"
                                        disabled={loading || !amount}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-credit-card me-2"></i>
                                                Nạp {amount ? parseInt(amount).toLocaleString() : ''}đ
                                            </>
                                        )}
                                    </Button>

                                    {/* Phương thức thanh toán */}
                                    <div className="payment-methods text-center">
                                        <p className="text-muted small mb-3">Phương thức thanh toán</p>
                                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                                            <div className="payment-badge">
                                                <i className="bi bi-bank"></i>
                                                <span>Internet Banking</span>
                                            </div>
                                            <div className="payment-badge">
                                                <i className="bi bi-credit-card"></i>
                                                <span>Thẻ Visa/Mastercard</span>
                                            </div>
                                            <div className="payment-badge">
                                                <i className="bi bi-qr-code"></i>
                                                <span>QR Code</span>
                                            </div>
                                        </div>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Ưu đãi */}
                        <Row className="mt-4 g-3">
                            <Col md={4}>
                                <div className="promo-badge promo-orange">
                                    <i className="bi bi-gift-fill"></i>
                                    <div>
                                        <div className="fw-bold">Nạp lần đầu</div>
                                        <small>Nhận ngay 20k</small>
                                    </div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="promo-badge promo-blue">
                                    <i className="bi bi-percent"></i>
                                    <div>
                                        <div className="fw-bold">Hoàn 5%</div>
                                        <small>Cho mỗi giao dịch</small>
                                    </div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="promo-badge promo-gradient">
                                    <i className="bi bi-shield-check"></i>
                                    <div>
                                        <div className="fw-bold">Bảo mật</div>
                                        <small>Thanh toán an toàn</small>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .wallet-topup-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
                }
                
                .topup-icon {
                    font-size: 4rem;
                    background: linear-gradient(135deg, #4361ee, #ff6b35);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .text-gradient {
                    background: linear-gradient(135deg, #ff6b35, #f7931e);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .topup-card {
                    background: white;
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                
                .topup-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
                }
                
                .amount-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 12px;
                    margin-bottom: 16px;
                }
                
                .amount-btn {
                    position: relative;
                    padding: 14px 8px;
                    border: 2px solid #e9ecef;
                    background: white;
                    border-radius: 16px;
                    font-weight: 600;
                    color: #333;
                    transition: all 0.3s;
                    cursor: pointer;
                }
                
                .amount-btn:hover {
                    border-color: #ff6b35;
                    transform: translateY(-2px);
                }
                
                .amount-btn.active {
                    border-color: #ff6b35;
                    background: linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,107,53,0.05));
                }
                
                .amount-value {
                    font-size: 1rem;
                }
                
                .check-icon {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    font-size: 1.2rem;
                    color: #ff6b35;
                    background: white;
                    border-radius: 50%;
                }
                
                .custom-amount-input {
                    border: 2px solid #e9ecef;
                    transition: all 0.3s;
                }
                
                .custom-amount-input:focus {
                    border-color: #4361ee;
                    box-shadow: 0 0 0 0.2rem rgba(67,97,238,0.25);
                }
                
                .btn-gradient {
                    background: linear-gradient(135deg, #ff6b35, #f7931e);
                    border: none;
                    font-size: 1.1rem;
                    transition: transform 0.3s;
                }
                
                .btn-gradient:hover {
                    transform: translateY(-2px);
                    background: linear-gradient(135deg, #e55a2b, #e6851a);
                }
                
                .payment-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: #f8f9fa;
                    border-radius: 40px;
                    font-size: 0.85rem;
                    color: #555;
                }
                
                .payment-badge i {
                    font-size: 1.1rem;
                }
                
                .promo-badge {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-radius: 16px;
                    color: white;
                    transition: transform 0.3s;
                }
                
                .promo-badge:hover {
                    transform: translateY(-3px);
                }
                
                .promo-badge i {
                    font-size: 1.5rem;
                }
                
                .promo-orange {
                    background: linear-gradient(135deg, #ff6b35, #f7931e);
                }
                
                .promo-blue {
                    background: linear-gradient(135deg, #4361ee, #3a0ca3);
                }
                
                .promo-gradient {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                }
                
                @media (max-width: 768px) {
                    .amount-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    
                    .amount-btn {
                        padding: 10px 6px;
                    }
                    
                    .amount-value {
                        font-size: 0.85rem;
                    }
                    
                    .promo-badge {
                        padding: 10px 16px;
                    }
                    
                    .promo-badge i {
                        font-size: 1.2rem;
                    }
                }
            `}</style>
        </div>
    );
}