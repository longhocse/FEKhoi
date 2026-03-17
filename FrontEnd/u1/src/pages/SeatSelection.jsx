import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import SeatLayout from "../components/SeatLayout";

export default function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();

  const trip = location.state?.trip;
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!trip) {
    return (
      <Container className="py-5 text-center">
        <Card className="soft-card p-5">
          <div className="display-1 text-muted mb-4">404</div>
          <h4 className="mb-3">Không có dữ liệu chuyến xe</h4>
          <p className="text-muted mb-4">
            Vui lòng chọn chuyến xe trước khi chọn ghế.
          </p>
          <Button
            variant="primary"
            className="pill px-4"
            onClick={() => navigate("/tuyen-xe")}
          >
            Tìm chuyến xe
          </Button>
        </Card>
      </Container>
    );
  }

  const handleContinue = () => {
    if (!selectedSeat) {
      alert("Vui lòng chọn ghế");
      return;
    }

    // Tìm thông tin ghế đầy đủ
    const seatInfo = trip.seats?.find(s => s.id === selectedSeat);

    if (!seatInfo) {
      alert("Không tìm thấy thông tin ghế");
      return;
    }

    // Lưu vào localStorage để phòng trường hợp refresh
    const bookingData = {
      trip: trip,
      seatId: seatInfo.id,
      seatName: seatInfo.seatName || seatInfo.name,
      totalAmount: trip.price
    };
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));

    // Chuyển đến trang thanh toán
    navigate("/thanh-toan", {
      state: bookingData
    });
  };

  // Tìm ghế đã chọn để hiển thị tên
  const selectedSeatInfo = trip.seats?.find(s => s.id === selectedSeat);

  return (
    <Container className="py-4">
      <h3 className="mb-4">Chọn ghế</h3>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="mb-3">
                <Badge bg="success" className="me-2">Còn trống</Badge>
                <Badge bg="danger" className="me-2">Đã đặt</Badge>
                <Badge bg="warning" className="me-2">Đang chọn</Badge>
                <Badge bg="secondary">Bảo trì</Badge>
              </div>

              <SeatLayout
                seats={trip.seats || []}
                selectedSeat={selectedSeat}
                setSelectedSeat={setSelectedSeat}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Thông tin vé</h5>

              <div className="mb-3">
                <small className="text-muted">Tuyến xe</small>
                <p className="fw-bold mb-2">
                  {trip.fromStation || trip.from} → {trip.toStation || trip.to}
                </p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Thời gian</small>
                <p className="mb-2">
                  {new Date(trip.startTime).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Nhà xe</small>
                <p className="mb-2">{trip.companyName || 'Đang cập nhật'}</p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Giá vé</small>
                <p className="h4 text-primary mb-2">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0
                  }).format(trip.price)}
                </p>
              </div>

              <div className="mb-4">
                <small className="text-muted">Ghế đã chọn</small>
                <p className="h5 mb-2">
                  {selectedSeatInfo ? (
                    <Badge bg="info" className="p-2">
                      {selectedSeatInfo.seatName || selectedSeatInfo.name}
                    </Badge>
                  ) : (
                    <span className="text-muted">Chưa chọn ghế</span>
                  )}
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                disabled={!selectedSeat}
                onClick={handleContinue}
              >
                {selectedSeat ? 'Tiếp tục thanh toán' : 'Vui lòng chọn ghế'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}