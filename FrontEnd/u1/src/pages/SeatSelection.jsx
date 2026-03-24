import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import SeatLayout from "../components/SeatLayout";
import axios from "axios";

export default function SeatSelection() {
  const { id } = useParams(); // Lấy ID từ URL nếu có
  const location = useLocation();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // Thay đổi: lưu mảng các ghế được chọn

  // Lấy dữ liệu từ state hoặc gọi API
  useEffect(() => {
    const loadData = async () => {
      try {
        if (location.state?.trip) {
          console.log("📦 Dùng dữ liệu từ state:", location.state.trip);
          setTrip(location.state.trip);
          setLoading(false);
        } else if (id) {
          console.log("🔄 Gọi API lấy chuyến xe ID:", id);
          const response = await axios.get(`http://localhost:5000/api/trips/${id}`);

          if (response.data.success) {
            setTrip(response.data.data);
          } else {
            setError("Không tìm thấy chuyến xe");
          }
          setLoading(false);
        } else {
          setError("Không có dữ liệu chuyến xe");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Lỗi:", err);
        setError("Không thể tải dữ liệu chuyến xe");
        setLoading(false);
      }
    };

    loadData();
  }, [id, location.state]);

  // Hàm xử lý chọn/bỏ chọn ghế
  const handleSeatSelect = (seat) => {
    if (seat.status !== 'AVAILABLE') {
      alert("Ghế này không khả dụng");
      return;
    }

    setSelectedSeats(prev => {
      // Kiểm tra ghế đã được chọn chưa
      const isSelected = prev.some(s => s.id === seat.id);

      if (isSelected) {
        // Nếu đã chọn thì bỏ chọn
        return prev.filter(s => s.id !== seat.id);
      } else {
        // Nếu chưa chọn thì thêm vào danh sách
        return [...prev, seat];
      }
    });
  };

  // Tính tổng tiền
  const totalAmount = selectedSeats.reduce((sum, seat) => sum + trip.price, 0);

  // Trong SeatSelection.jsx, sửa hàm handleContinue

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế");
      return;
    }

    const bookingData = {
      trip: {
        id: trip.id,
        fromStation: trip.fromStation,
        toStation: trip.toStation,
        startTime: trip.startTime,
        price: trip.price,
        companyName: trip.companyName,
        vehicleName: trip.vehicleName,
        estimatedDuration: trip.estimatedDuration
      },
      seats: selectedSeats.map(seat => ({
        id: seat.id,
        name: seat.seatName || seat.name,
        price: trip.price
      })),
      seatIds: selectedSeats.map(seat => seat.id), // Mảng ID ghế
      seatNames: selectedSeats.map(seat => seat.seatName || seat.name).join(', '),
      totalAmount: totalAmount,
      quantity: selectedSeats.length
    };

    localStorage.setItem('currentBooking', JSON.stringify(bookingData));

    navigate("/thanh-toan", {
      state: bookingData
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải thông tin chuyến xe...</p>
      </Container>
    );
  }

  if (error || !trip) {
    return (
      <Container className="py-5 text-center">
        <Card className="soft-card p-5">
          <div className="display-1 text-muted mb-4">404</div>
          <h4 className="mb-3">Không có dữ liệu chuyến xe</h4>
          <p className="text-muted mb-4">
            {error || "Vui lòng chọn chuyến xe trước khi chọn ghế."}
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

  return (
    <Container className="py-4">
      <Button
        variant="link"
        className="mb-3 text-decoration-none"
        onClick={() => navigate(-1)}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Quay lại
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Chọn ghế - {trip.fromStation} → {trip.toStation}</h3>
        <Badge bg="info" className="p-2">
          <i className="bi bi-check-circle me-1"></i>
          Đã chọn: {selectedSeats.length} ghế
        </Badge>
      </div>

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
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm " >
            <Card.Body>
              <h5 className="mb-3">Thông tin đặt vé</h5>

              <div className="mb-3">
                <small className="text-muted">Tuyến xe</small>
                <p className="fw-bold mb-2">
                  {trip.fromStation} → {trip.toStation}
                </p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Thời gian khởi hành</small>
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
                <small className="text-muted">Giá vé / ghế</small>
                <p className="h5 text-primary mb-2">
                  {formatCurrency(trip.price)}
                </p>
              </div>

              {/* Danh sách ghế đã chọn */}
              <div className="mb-3">
                <small className="text-muted">Ghế đã chọn ({selectedSeats.length})</small>
                <div className="mt-2">
                  {selectedSeats.length === 0 ? (
                    <p className="text-muted mb-0">Chưa chọn ghế</p>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {selectedSeats.map(seat => (
                        <Badge
                          key={seat.id}
                          bg="warning"
                          className="p-2 d-flex align-items-center gap-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSeatSelect(seat)}
                        >
                          {seat.seatName || seat.name}
                          <i className="bi bi-x-circle ms-1"></i>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <hr />

              {/* Tổng tiền */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Số lượng ghế:</span>
                  <span className="fw-bold">{selectedSeats.length}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tổng tiền:</span>
                  <h5 className="text-primary mb-0">{formatCurrency(totalAmount)}</h5>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                disabled={selectedSeats.length === 0}
                onClick={handleContinue}
              >
                {selectedSeats.length === 0
                  ? 'Vui lòng chọn ghế'
                  : `Tiếp tục thanh toán (${selectedSeats.length} ghế)`}
              </Button>

              {selectedSeats.length > 0 && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="w-100 mt-2"
                  onClick={() => setSelectedSeats([])}
                >
                  <i className="bi bi-arrow-repeat me-1"></i>
                  Bỏ chọn tất cả
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}