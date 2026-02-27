import { Container, Row, Col, Card, Button, Badge, ListGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state?.route || {
    id: 1,
    from: "Đà Nẵng",
    to: "Hồ Chí Minh",
    price: 500000,
    date: "14/1/2026",
    time: "08:00 sáng",
    busType: "Xe phổ thông",
    company: "Busgo Express"
  };

  // Tạo ma trận ghế 6x4 cho mỗi tầng
  const generateSeats = (floor) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cols = [1, 2, 3, 4];
    const seats = [];

    // Tạo một số ghế đã đặt ngẫu nhiên
    const bookedSeats = ['A3', 'B4', 'C2', 'D1', 'E3', 'F4'];

    rows.forEach(row => {
      cols.forEach(col => {
        const seatId = `${row}${col}`;
        seats.push({
          id: seatId,
          floor: floor,
          row: row,
          col: col,
          status: bookedSeats.includes(seatId) ? 'booked' : 'available'
        });
      });
    });

    return seats;
  };

  const [seats, setSeats] = useState([
    ...generateSeats(1),
    ...generateSeats(2).map(seat => ({ ...seat, id: seat.id + 'F' })) // Thêm 'F' cho tầng 2
  ]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeFloor, setActiveFloor] = useState(1);

  // Lọc ghế theo tầng
  const floorSeats = seats.filter(seat => seat.floor === activeFloor);

  // Nhóm ghế theo cột để hiển thị ma trận
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = [1, 2, 3, 4];

  const handleSeatClick = (seat) => {
    if (seat.status === "booked") return;

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seat.id));
    } else {
      if (selectedSeats.length < 4) {
        setSelectedSeats([...selectedSeats, seat.id]);
      }
    }
  };

  const getSeatColor = (seat) => {
  if (seat.status === "booked") return "bg-secondary text-white";

  if (selectedSeats.includes(seat.id))
    return "bg-success text-white";

  return "bg-white text-dark border border-dark";
};

  const totalPrice = route.price * selectedSeats.length;

  const handlePayment = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/seats/hold",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId: "trip1",
            seatNumbers: selectedSeats
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      // Lưu sessionId để Payment confirm
      localStorage.setItem("sessionId", data.sessionId);

      navigate('/thanh-toan', {
        state: {
          route: route,
          seats: selectedSeats,
          totalPrice: totalPrice
        }
      });

    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server");
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Chọn chỗ ngồi</h1>

      {/* Header với chọn tầng */}
      <div className="d-flex justify-content-center gap-5 mb-5">
        <div className="text-center">
          <h3 className="fw-bold mb-3">Tầng 1</h3>
          <Button
            variant={activeFloor === 1 ? "primary" : "outline-primary"}
            className="pill px-4"
            onClick={() => setActiveFloor(1)}
          >
            Xem Tầng 1
          </Button>
        </div>

        <div className="text-center">
          <h3 className="fw-bold mb-3">Tầng 2</h3>
          <Button
            variant={activeFloor === 2 ? "primary" : "outline-primary"}
            className="pill px-4"
            onClick={() => setActiveFloor(2)}
          >
            Xem Tầng 2
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Phần bên trái: Sơ đồ ghế */}
        <Col lg={8}>
          <Card className="soft-card p-4 mb-4">
            {/* Legend */}
            <div className="d-flex justify-content-center gap-4 mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success" style={{ width: 24, height: 24, borderRadius: 6 }}></div>
                <span className="fw-semibold">Còn trống</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary-custom" style={{ width: 24, height: 24, borderRadius: 6 }}></div>
                <span className="fw-semibold">Đã chọn</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="bg-secondary" style={{ width: 24, height: 24, borderRadius: 6 }}></div>
                <span className="fw-semibold">Đã đặt</span>
              </div>
            </div>

            {/* Khu vực tài xế */}
            <div className="text-center mb-5">
              <div className="position-relative">
                <div className="mb-3">
                  <h4 className="fw-bold mb-2">Tài xế</h4>
                  <div style={{
                    width: 150,
                    height: 70,
                    background: '#343a40',
                    color: 'white',
                    margin: '0 auto',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    🚌 Khu vực tài xế
                  </div>
                </div>
              </div>
            </div>

            {/* Sơ đồ ghế dạng ma trận */}
            <div className="seat-matrix">
              <div className="d-flex justify-content-center">
                {/* Cột tiêu đề (số ghế) */}
                <div className="d-flex flex-column me-3" style={{ marginTop: '40px' }}>
                  {rows.map(row => (
                    <div key={`header-${row}`} className="text-center mb-2" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="fw-bold fs-5">{row}</div>
                    </div>
                  ))}
                </div>

                {/* Ma trận ghế */}
                <div className="d-flex flex-column">
                  {/* Tiêu đề cột */}
                  <div className="d-flex mb-2">
                    {cols.map(col => (
                      <div key={`col-header-${col}`} className="text-center" style={{ width: '80px' }}>
                        <div className="fw-bold fs-5">{col}</div>
                      </div>
                    ))}
                  </div>

                  {/* Các hàng ghế */}
                  {rows.map(row => (
                    <div key={`row-${row}`} className="d-flex mb-3">
                      {cols.map(col => {
                        const seatId = `${row}${col}${activeFloor === 2 ? 'F' : ''}`;
                        const seat = floorSeats.find(s => s.id === seatId);

                        if (!seat) return null;

                        return (
                          <div key={seat.id} className="mx-1">
                            <div
                              className={`seat-matrix-item ${getSeatColor(seat)} ${seat.status === "booked" ? "disabled" : "cursor-pointer"}`}
                              onClick={() => handleSeatClick(seat)}
                              style={{
                                width: '70px',
                                height: '60px',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                opacity: seat.status === "booked" ? 0.7 : 1,
                                transition: 'all 0.2s'
                              }}
                            >
                              <div className="fw-bold fs-6">{row}{col}</div>
                              <div className="extra-small mt-1">
                                {seat.status === "booked" ? "Đã đặt" :
                                  selectedSeats.includes(seat.id) ? "Đã chọn" : "Trống"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mũi tên chỉ hướng */}
              <div className="text-center mt-4">
                <div className="d-inline-flex align-items-center bg-light px-4 py-2 rounded-pill">
                  <i className="bi bi-arrow-right text-muted me-2"></i>
                  <span className="text-muted">Hướng di chuyển của xe</span>
                  <i className="bi bi-arrow-right text-muted ms-2"></i>
                </div>
              </div>
            </div>

            {/* Chú thích */}
            <div className="text-center mt-4 text-muted small">
              * Ghế màu xám đã được đặt trước. Tối đa 4 ghế/đơn hàng.
            </div>
          </Card>

          {/* Hướng dẫn */}
          <Card className="soft-card p-4">
            <h5 className="fw-bold mb-3">Hướng dẫn chọn ghế:</h5>
            <div className="row">
              <div className="col-md-6">
                <ul className="mb-0">
                  <li className="mb-2">• Nhấn vào ghế <span className="text-success fw-semibold">xanh</span> để chọn</li>
                  <li className="mb-2">• Ghế <span className="text-primary-custom fw-semibold">cam</span> là ghế bạn đã chọn</li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="mb-0">
                  <li className="mb-2">• Ghế <span className="text-secondary fw-semibold">xám</span> đã có người đặt</li>
                  <li>• Bạn có thể chọn tối đa 4 ghế</li>
                </ul>
              </div>
            </div>
          </Card>
        </Col>

        {/* Phần bên phải: Tổng hóa đơn */}
        <Col lg={4}>
          <Card className="soft-card p-4 sticky-top" style={{ top: '20px' }}>
            <h4 className="mb-4 border-bottom pb-3">Tổng hóa đơn</h4>

            {/* Thông tin chuyến đi */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-geo-alt text-primary-custom fs-4 me-3"></i>
                <div>
                  <div className="fw-bold fs-5">{route.from} → {route.to}</div>
                  <div className="text-muted small">{route.date} • {route.time}</div>
                </div>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Loại xe:</span>
                <span className="fw-semibold">{route.busType}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Hãng xe:</span>
                <span>{route.company}</span>
              </div>
            </div>

            {/* Ghế đã chọn */}
            {selectedSeats.length > 0 ? (
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Ghế đã chọn:</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedSeats.map(seatId => (
                    <Badge key={seatId} bg="primary-custom" className="px-3 py-2 fs-6">
                      {seatId}
                    </Badge>
                  ))}
                </div>
                <div className="d-flex justify-content-between">
                  <span>Giá vé × {selectedSeats.length}:</span>
                  <span className="fw-bold">{route.price.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning text-center mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Vui lòng chọn ít nhất 1 ghế
              </div>
            )}

            {/* Tổng tiền */}
            <div className="py-3 border-top border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="m-0">Tổng tiền:</h5>
                <div className="fs-2 fw-bold text-primary-custom">
                  {totalPrice.toLocaleString("vi-VN")}₫
                </div>
              </div>
            </div>

            {/* Nút thanh toán */}
            <Button
              variant="primary"
              className="w-100 pill py-3 fs-5 mt-4"
              onClick={handlePayment}
              disabled={selectedSeats.length === 0}
              size="lg"
            >
              <i className="bi bi-credit-card me-2"></i>
              {selectedSeats.length === 0 ? "Chọn ghế để thanh toán" : "Tiến hành thanh toán"}
            </Button>

            {/* Các tùy chọn khác */}
            <div className="mt-4">
              <Button
                variant="outline-secondary"
                className="w-100 mb-2"
                onClick={() => setSelectedSeats([])}
                disabled={selectedSeats.length === 0}
              >
                <i className="bi bi-x-circle me-2"></i>
                Bỏ chọn tất cả
              </Button>

              <Button
                variant="link"
                className="w-100 text-primary-custom"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Quay lại chi tiết vé
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}