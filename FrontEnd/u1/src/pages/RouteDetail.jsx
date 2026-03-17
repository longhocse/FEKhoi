import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SeatLayout from "../components/SeatLayout";

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

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

      // Sửa endpoint API
      const response = await axios.get(`http://localhost:5000/api/trips/${id}`);

      console.log("✅ Chi tiết chuyến xe:", response.data);

      // Xử lý response
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
    if (!selectedSeat) {
      alert("Vui lòng chọn ghế");
      return;
    }

    console.log("🪑 Ghế được chọn:", selectedSeat);
    console.log("🚌 Trip data:", trip);

    // Tìm thông tin ghế đầy đủ
    const seatInfo = trip.seats?.find(s => s.id === selectedSeat);

    // Dữ liệu gửi sang SeatSelection
    const tripData = {
      id: trip.id,
      fromStation: trip.fromStation,
      toStation: trip.toStation,
      startTime: trip.startTime,
      price: trip.price,
      companyName: trip.companyName,
      vehicleName: trip.vehicleName,
      estimatedDuration: trip.estimatedDuration,
      seats: trip.seats || []
    };

    console.log("📦 Dữ liệu gửi sang SeatSelection:", tripData);

    // Chuyển đến trang chọn ghế
    navigate('/chon-ghe', {
      state: {
        trip: tripData,
        selectedSeat: selectedSeat,
        seatInfo: seatInfo
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price || 0);
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
                    <h6 className="text-muted mb-1">Thời gian</h6>
                    <p className="mb-0">{formatDate(trip.startTime)}</p>
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

          {/* Danh sách ghế */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Chọn ghế</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg="success" className="me-2">Còn trống</Badge>
                <Badge bg="danger" className="me-2">Đã đặt</Badge>
                <Badge bg="secondary">Bảo trì</Badge>
              </div>

              <SeatLayout
                seats={trip.seats || []}
                selectedSeat={selectedSeat}
                setSelectedSeat={setSelectedSeat}
              />
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
                            Đến: {point.arrivalTime} - Đi: {point.departureTime}
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
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
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
                <h6 className="text-muted mb-2">Ghế đã chọn</h6>
                <p className="fw-bold">
                  {selectedSeat ?
                    trip.seats?.find(s => s.id === selectedSeat)?.seatName || `Ghế ${selectedSeat}`
                    : 'Chưa chọn ghế'}
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                disabled={!selectedSeat}
                onClick={handleSelectSeats}
              >
                Chọn ghế
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}