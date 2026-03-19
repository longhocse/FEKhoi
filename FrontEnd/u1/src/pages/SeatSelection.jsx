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
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Lấy dữ liệu từ state hoặc gọi API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Nếu có dữ liệu từ state (từ RouteDetail cũ)
        if (location.state?.trip) {
          console.log("📦 Dùng dữ liệu từ state:", location.state.trip);
          setTrip(location.state.trip);
          setLoading(false);
        }
        // Nếu có ID trong URL (từ RouteDetail mới)
        else if (id) {
          console.log("🔄 Gọi API lấy chuyến xe ID:", id);
          const response = await axios.get(`http://localhost:5000/api/trips/${id}`);

          if (response.data.success) {
            setTrip(response.data.data);
          } else {
            setError("Không tìm thấy chuyến xe");
          }
          setLoading(false);
        }
        // Không có dữ liệu
        else {
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

    // Dữ liệu gửi sang Payment
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
      seatId: seatInfo.id,
      seatName: seatInfo.seatName || seatInfo.name,
      totalAmount: trip.price
    };

    // Lưu vào localStorage để phòng trường hợp refresh
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));

    // Chuyển đến trang thanh toán
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

  const selectedSeatInfo = trip.seats?.find(s => s.id === selectedSeat);

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

      <h3 className="mb-4">Chọn ghế - {trip.fromStation} → {trip.toStation}</h3>

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
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <h5 className="mb-3">Thông tin vé</h5>

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
                <small className="text-muted">Giá vé</small>
                <p className="h4 text-primary mb-2">
                  {formatCurrency(trip.price)}
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