import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (id) {
      fetchTripDetail();
    } else {
      setError('Không có ID chuyến xe');
      setLoading(false);
    }
  }, [id]);

  const fetchTripDetail = async () => {
    try {
      setLoading(true);
      console.log("🔄 Đang lấy chi tiết chuyến xe ID:", id);

      const response = await axios.get(`http://localhost:5000/api/trips/${id}`);

      console.log("✅ Chi tiết chuyến xe:", response.data);

      if (response.data.success) {
        setTrip(response.data.data);
      } else if (response.data.data) {
        setTrip(response.data.data);
      } else {
        setTrip(response.data);
      }
    } catch (err) {
      console.error("❌ Lỗi chi tiết:", err);
      if (err.response?.status === 404) {
        setError('Không tìm thấy chuyến xe với ID này');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeats = () => {
    // Chuyển đến trang chọn ghế với ID chuyến xe
    navigate(`/chon-ghe/${trip.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price || 0);
  };


  const formatTimeOnly = (timeString) => {
    if (!timeString) return 'N/A';

    // Nếu backend trả "HH:mm:ss"
    if (typeof timeString === 'string' && timeString.length <= 8) {
      return timeString.slice(0, 5);
    }

    const date = new Date(timeString);

    if (isNaN(date)) return timeString;

    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải thông tin chuyến xe...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Không tìm thấy chuyến xe</Alert>
        <Button variant="primary" onClick={() => navigate('/tuyen-xe')}>
          Quay lại danh sách
        </Button>
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

      <Row>
        <Col lg={8}>
          {/* Thông tin chuyến xe */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Chi tiết chuyến xe</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Tuyến xe</h6>
                    <h4>{trip.fromStation} → {trip.toStation}</h4>
                    <small className="text-muted">{trip.fromProvince} - {trip.toProvince}</small>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Thời gian khởi hành</h6>
                    <p className="fw-bold mb-0">{formatDate(trip.startTime)}</p>
                    <small className="text-muted">
                      Thời gian dự kiến: {Math.floor(trip.estimatedDuration / 60)} giờ {trip.estimatedDuration % 60} phút
                    </small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Nhà xe</h6>
                    <p className="fw-bold mb-0">{trip.companyName}</p>
                    <small className="text-muted">📞 {trip.companyPhone}</small>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Loại xe</h6>
                    <p className="mb-0">{trip.vehicleName}</p>
                    <small className="text-muted">{trip.vehicleType} - {trip.numberOfFloors} tầng</small>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Giá vé</h6>
                    <h3 className="text-primary">{formatPrice(trip.price)}</h3>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Điểm dừng */}
          {trip.timePoints && trip.timePoints.length > 0 && (
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Điểm dừng</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {trip.timePoints.map((point, index) => (
                    <Col key={point.id || index} md={6} className="mb-3">
                      <div className="d-flex">
                        <div className="me-3">
                          <Badge bg="info">{index + 1}</Badge>
                        </div>
                        <div>
                          <div className="fw-bold">{point.stopPoint}</div>
                          <div className="small text-muted">
                            Đến: {formatTimeOnly(point.arrivalTime)} - Đi: {formatTimeOnly(point.departureTime)}
                          </div>
                          <div className="small text-muted">
                            Dừng: {point.stopDuration} phút
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Card đặt vé - chỉ có nút chọn ghế */}
          <Card
            className="shadow-sm"
          >
            <Card.Header className="bg-white">
              <h5 className="mb-0">Đặt vé</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6 className="text-muted mb-2">Tuyến xe</h6>
                <p className="fw-bold">{trip.fromStation} → {trip.toStation}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-2">Giá vé</h6>
                <h4 className="text-primary">{formatPrice(trip.price)}</h4>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-2">Thời gian</h6>
                <p>{formatDate(trip.startTime)}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-2">Nhà xe</h6>
                <p>{trip.companyName}</p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={handleSelectSeats}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Chọn ghế
              </Button>
              <small className="text-muted d-block text-center mt-2">
                Bạn sẽ được chuyển đến trang chọn ghế
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}