// FrontEnd/u1/src/pages/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const orderCode = searchParams.get('orderCode');
                if (orderCode) {
                    const token = localStorage.getItem("token");
                    const response = await axios.get(
                        `http://localhost:5000/api/payos/status/${orderCode}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setStatus(response.data.data);
                }
            } catch (err) {
                console.error("Lỗi kiểm tra:", err);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang xác nhận giao dịch...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5 text-center">
            <Card className="shadow-sm rounded-4 p-4">
                <div className="text-success mb-3">
                    <i className="bi bi-check-circle-fill fs-1"></i>
                </div>
                <h3 className="fw-bold">Nạp tiền thành công!</h3>
                <p className="text-muted">Số tiền đã được cộng vào ví của bạn.</p>
                <Button
                    variant="primary"
                    className="rounded-pill px-4"
                    onClick={() => navigate("/vi")}
                >
                    Về trang ví
                </Button>
            </Card>
        </Container>
    );
}