import { Container, Card, Row, Col, Form, Button, Badge, ListGroup, Accordion } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [method, setMethod] = useState("cash");
  const { trip, seatId } = location.state || {};

  if (!trip || !seatId) {
    return <div className="text-center mt-5">Không có dữ liệu đặt vé</div>;
  }
  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/trips/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tripId: trip.id,
          seatId: seatId
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đặt vé thành công");
        navigate("/");
        //navigate("/my-tickets");
      } else {
        alert(data.message || "Đặt vé thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi server");
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <h1 className="mb-4">Phương thức thanh toán</h1>

      {/* Ô thanh toán */}
      <Card className="soft-card mb-4 p-4">
        <h4 className="mb-3">Chọn phương thức thanh toán</h4>
        <p className="text-muted mb-4">
          Không cần nhập thông tin. Xác nhận thanh toán tức thì, nhanh chóng và ít sai sót.
        </p>

        {/* Chọn phương thức */}
        <div className="text-center mt-4">

          <Row className="mb-4">
            <Col md={6}>
              <Button
                variant={method === "cash" ? "primary" : "outline-primary"}
                className="w-100 py-3"
                onClick={() => setMethod("cash")}
              >
                Thanh toán bằng tiền mặt
              </Button>
            </Col>

            <Col md={6}>
              <Button
                variant={method === "qr" ? "primary" : "outline-primary"}
                className="w-100 py-3"
                onClick={() => setMethod("qr")}
              >
                QR chuyển khoản
              </Button>
            </Col>
          </Row>

          {/* Nội dung theo phương thức */}
          {method === "qr" && (
            <>
              <div style={{
                width: 200,
                height: 200,
                margin: '0 auto',
                background: '#f8f9fa',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #dee2e6'
              }}>
                <div className="text-muted">QR Code Placeholder</div>
              </div>

              <p className="text-muted small mt-2">
                Quét mã để thanh toán
              </p>
            </>
          )}

          {method === "cash" && (
            <p className="text-muted mt-3">
              Thanh toán trực tiếp bằng tiền mặt tại bến xe.
            </p>
          )}

        </div>

      </Card>

      {/* Tổng tiền */}
      <Card className="soft-card mt-4 p-4 bg-light">
        <div className="text-center">
          <div className="text-muted small">Tổng tiền</div>
          <div className="display-4 fw-bold text-primary-custom">250.000₫</div>
        </div>
      </Card>

      {/* Thông tin đơn hàng */}
      <Card className="soft-card mt-4 p-4">
        <div className="mb-3">
          <div className="text-muted small">Bạn có thể áp dụng nhiều mã cùng lúc</div>
        </div>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <div className="fw-bold mb-1">Vexere</div>
            <div className="text-muted small">T7, 17/01/2026</div>
            <Button variant="link" className="p-0 text-primary-custom small">Chi tiết</Button>
          </div>
          <Badge bg="light" text="dark" className="border">250.000₫</Badge>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <div className="fw-semibold">Daiichi Travel</div>
            <div className="text-muted small">Sơ đồ 45 (Chuẩn)</div>
          </div>
          <div>1</div>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">Văn phòng 172 Trần Quang Khải</div>
          </div>
          <Button variant="outline-primary" size="sm" className="pill">
            Thay đổi
          </Button>
        </div>
      </Card>

      {/* Nút điều hướng */}
      <div className="d-flex justify-content-between mt-4">
        <Button variant="outline-secondary" className="pill px-4" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Button
          variant="primary"
          className="pill px-5"
          onClick={handlePayment}
        >
          Xác nhận thanh toán
        </Button>
      </div>
    </Container>
  );
}