// src/pages/RouteDetail.jsx
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CompanyReviews from '../components/CompanyReviews';

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

  useEffect(() => {
    if (trip) {
      console.log("🏢 Company ID:", trip.companyId);
      console.log("🏢 Company Name:", trip.companyName);
    }
  }, [trip]);

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
    return timeString.substring(11, 16);
  };

  const getServiceIcon = (service) => {
    const s = service.toLowerCase();
    if (s.includes("wifi")) return "bi-wifi";
    if (s.includes("điều hòa") || s.includes("air")) return "bi-snow";
    if (s.includes("cắm") || s.includes("sạc")) return "bi-plug";
    if (s.includes("nước")) return "bi-cup-straw";
    if (s.includes("tv")) return "bi-tv";
    if (s.includes("chăn") || s.includes("gối")) return "bi-moon";
    return "bi-stars";
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải thông tin chuyến xe...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="rounded-3">
          <Alert.Heading><i className="bi bi-exclamation-triangle-fill me-2"></i>Lỗi!</Alert.Heading>
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
        <Alert variant="warning" className="rounded-3">Không tìm thấy chuyến xe</Alert>
        <Button variant="primary" className="rounded-pill px-4" onClick={() => navigate('/tuyen-xe')}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  return (
    <div className="route-detail-page">
      <Container className="py-4">
        {/* Nút quay lại */}
        <Button
          variant="link"
          className="back-btn mb-4"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </Button>

        <Row className="g-4">
          {/* Cột trái - Thông tin chính */}
          <Col lg={8}>
            {/* Thông tin chuyến xe */}
            <Card className="info-card mb-4">
              <div className="card-badge">
                <Badge bg="warning" className="rounded-pill px-3 py-2 text-dark">
                  <i className="bi bi-star-fill me-1"></i> Ưu đãi 10%
                </Badge>
              </div>
              <Card.Body className="p-4">
                <div className="route-header mb-4">
                  <div className="route-points">
                    <div className="route-from">
                      <h2 className="fw-bold mb-0">{trip.fromStation}</h2>
                      <small className="text-muted">{trip.fromProvince}</small>
                    </div>
                    <div className="route-arrow">
                      <i className="bi bi-arrow-right-short"></i>
                    </div>
                    <div className="route-to">
                      <h2 className="fw-bold mb-0">{trip.toStation}</h2>
                      <small className="text-muted">{trip.toProvince}</small>
                    </div>
                  </div>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <div className="info-item">
                      <div className="info-icon">
                        <i className="bi bi-calendar-event"></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">Thời gian khởi hành</div>
                        <div className="info-value fw-semibold">{formatDate(trip.startTime)}</div>
                        <small className="text-muted">
                          <i className="bi bi-hourglass-split me-1"></i>
                          Dự kiến: {Math.floor(trip.estimatedDuration / 60)} giờ {trip.estimatedDuration % 60} phút
                        </small>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item">
                      <div className="info-icon">
                        <i className="bi bi-tag"></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">Giá vé</div>
                        <div className="price-value">{formatPrice(trip.price)}</div>
                        <small className="text-muted">Đã bao gồm VAT</small>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item">
                      <div className="info-icon">
                        <i className="bi bi-building"></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">Nhà xe</div>
                        <div className="info-value fw-semibold">{trip.user?.name || 'Không xác định'}</div>
                        <small className="text-muted">
                          <i className="bi bi-telephone me-1"></i>
                          {trip.user?.phone || 'N/A'}
                        </small>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item">
                      <div className="info-icon">
                        <i className="bi bi-bus-front"></i>
                      </div>
                      <div className="info-content">
                        <div className="info-label">Loại xe</div>
                        <div className="info-value fw-semibold">{trip.vehicleName}</div>
                        <small className="text-muted">{trip.vehicleType} - {trip.numberOfFloors} tầng</small>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Tiện ích */}
                {trip.services && trip.services.length > 0 && (
                  <div className="services-section mt-4">
                    <div className="services-title">
                      <i className="bi bi-stars me-2 text-warning"></i>
                      Tiện ích trên xe
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {trip.services.map((service, index) => (
                        <Badge
                          key={index}
                          bg="light"
                          className="service-badge px-3 py-2"
                        >
                          <i className={`bi ${getServiceIcon(service)} me-1`}></i>
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Điểm dừng */}
            {trip.timePoints && trip.timePoints.length > 0 && (
              <Card className="stops-card">
                <Card.Header className="bg-white border-0 pt-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-pin-map-fill me-2 text-primary"></i>
                    Điểm dừng
                  </h5>
                </Card.Header>
                <Card.Body className="p-4 pt-0">
                  <div className="timeline">
                    {trip.timePoints.map((point, index) => (
                      <div key={point.id || index} className="timeline-item">
                        <div className="timeline-marker">
                          <span>{index + 1}</span>
                        </div>
                        <div className="timeline-content">
                          <div className="fw-semibold">{point.stopPoint}</div>
                          <div className="timeline-time">
                            <i className="bi bi-clock me-1"></i>
                            Đến: {formatTimeOnly(point.arrivalTime)} - Đi: {formatTimeOnly(point.departureTime)}
                            <span className="ms-2 text-muted">(Dừng {point.stopDuration} phút)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Cột phải - Đặt vé */}
          <Col lg={4}>
            <div className="booking-sidebar">
              <Card className="booking-card sticky-top" style={{ top: "20px" }}>
                <div className="booking-header">
                  <i className="bi bi-ticket-perforated"></i>
                  <h5 className="mb-0 fw-bold">Đặt vé ngay</h5>
                </div>
                <Card.Body className="p-4">
                  <div className="booking-info">
                    <div className="booking-row">
                      <span className="booking-label">Tuyến xe</span>
                      <span className="booking-value fw-semibold">
                        {trip.fromStation} → {trip.toStation}
                      </span>
                    </div>
                    <div className="booking-row">
                      <span className="booking-label">Giá vé</span>
                      <span className="booking-price">{formatPrice(trip.price)}</span>
                    </div>
                    <div className="booking-row">
                      <span className="booking-label">Thời gian</span>
                      <span className="booking-value">{formatDate(trip.startTime)}</span>
                    </div>
                    <div className="booking-row">
                      <span className="booking-label">Nhà xe</span>
                      <span className="booking-value">{trip.user?.name || 'Không xác định'}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="booking-btn w-100"
                    onClick={handleSelectSeats}
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    Chọn ghế
                  </Button>
                  <div className="booking-note">
                    <i className="bi bi-info-circle me-1"></i>
                    Bạn sẽ được chuyển đến trang chọn ghế
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Đánh giá nhà xe */}
        <div className="reviews-section mt-5">
          <CompanyReviews companyId={trip.companyId} companyName={trip.user?.name} />
        </div>

        <style>{`
          .route-detail-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
          }
          
          .back-btn {
            color: #4361ee;
            font-weight: 500;
            padding: 8px 0;
          }
          
          .back-btn:hover {
            color: #ff6b35;
          }
          
          .info-card {
            border: none;
            border-radius: 24px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }
          
          .card-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 1;
          }
          
          .route-points {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .route-from, .route-to {
            text-align: center;
          }
          
          .route-arrow i {
            font-size: 2rem;
            color: #ff6b35;
          }
          
          .info-item {
            display: flex;
            gap: 15px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 16px;
            transition: transform 0.2s;
          }
          
          .info-item:hover {
            transform: translateY(-3px);
          }
          
          .info-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, rgba(67,97,238,0.1), rgba(255,107,53,0.1));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            color: #4361ee;
          }
          
          .info-content {
            flex: 1;
          }
          
          .info-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: #6c757d;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            font-size: 1rem;
            color: #1a1a2e;
          }
          
          .price-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: #ff6b35;
          }
          
          .services-title {
            font-size: 0.85rem;
            font-weight: 600;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .service-badge {
            background: #f0f2f5 !important;
            color: #333 !important;
            border-radius: 30px !important;
            font-size: 0.8rem;
          }
          
          .stops-card {
            border: none;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }
          
          .timeline {
            position: relative;
            padding-left: 30px;
          }
          
          .timeline::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 10px;
            bottom: 10px;
            width: 2px;
            background: linear-gradient(to bottom, #4361ee, #ff6b35);
          }
          
          .timeline-item {
            position: relative;
            margin-bottom: 24px;
          }
          
          .timeline-marker {
            position: absolute;
            left: -30px;
            top: 0;
            width: 24px;
            height: 24px;
            background: white;
            border: 2px solid #4361ee;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: bold;
            color: #4361ee;
          }
          
          .timeline-content {
            padding-left: 15px;
          }
          
          .timeline-time {
            font-size: 0.8rem;
            color: #6c757d;
          }
          
          .booking-sidebar {
            position: relative;
          }
          
          .booking-card {
            border: none;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }
          
          .booking-header {
            background: linear-gradient(135deg, #4361ee, #3a0ca3);
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .booking-header i {
            font-size: 1.5rem;
          }
          
          .booking-info {
            margin-bottom: 24px;
          }
          
          .booking-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .booking-label {
            color: #6c757d;
            font-size: 0.85rem;
          }
          
          .booking-price {
            font-size: 1.2rem;
            font-weight: 700;
            color: #ff6b35;
          }
          
          .booking-btn {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            border: none;
            padding: 14px;
            font-weight: 600;
            border-radius: 40px;
            transition: transform 0.2s;
          }
          
          .booking-btn:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, #e55a2b, #e6851a);
          }
          
          .booking-note {
            text-align: center;
            font-size: 0.7rem;
            color: #6c757d;
            margin-top: 12px;
          }
          
          .reviews-section {
            background: white;
            border-radius: 24px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          
          @media (max-width: 768px) {
            .route-points {
              flex-direction: column;
              gap: 10px;
            }
            
            .route-arrow i {
              transform: rotate(90deg);
            }
            
            .info-item {
              flex-direction: column;
              text-align: center;
            }
            
            .info-icon {
              margin: 0 auto;
            }
            
            .timeline {
              padding-left: 20px;
            }
            
            .timeline-marker {
              left: -20px;
            }
          }
        `}</style>
      </Container>
    </div>
  );
}