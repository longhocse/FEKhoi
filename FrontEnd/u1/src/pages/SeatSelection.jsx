// src/pages/SeatSelection.jsx
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import SeatLayout from "../components/SeatLayout";
import axios from "axios";

export default function SeatSelection() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (location.state?.trip) {
          setTrip(location.state.trip);
          setLoading(false);
        } else if (id) {
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
        console.error("❌ Lỗi tải chuyến xe:", err);
        setError("Không thể tải thông tin chuyến xe");
        setLoading(false);
      }
    };

    loadData();
  }, [id, location.state]);

  const handleSeatSelect = (seat) => {
    if (seat.status !== "AVAILABLE") {
      alert("Ghế này không khả dụng");
      return;
    }

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại!");
      navigate("/dang-nhap");
      return;
    }

    setHolding(true);

    try {
      console.log("=== DEBUG TOKEN ===");
      console.log("Token từ localStorage:", token.substring(0, 60) + "...");

      const res = await axios.post(
        "http://localhost:5000/api/trips/seat-holds",
        {
          tripId: trip.id,
          seatIds: selectedSeats.map(s => s.id)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("✅ Giữ ghế thành công:", res.data);

      const bookingData = {
        trip: {
          id: trip.id,
          fromStation: trip.fromStation,
          toStation: trip.toStation,
          startTime: trip.startTime,
          price: trip.price,
          companyName: trip.companyName || "",
          vehicleName: trip.vehicleName || "",
        },
        seatIds: selectedSeats.map(seat => seat.id),
        seats: selectedSeats.map(seat => ({
          id: seat.id,
          name: seat.seatName || seat.name,
          price: trip.price
        })),
        totalAmount: trip.price * selectedSeats.length,
        quantity: selectedSeats.length
      };

      localStorage.setItem("currentBooking", JSON.stringify(bookingData));
      navigate("/thanh-toan", { state: bookingData });

    } catch (err) {
      console.error("❌ FULL ERROR:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);

      if (err.response?.status === 401) {
        alert("Token không hợp lệ hoặc đã hết hạn.\n\nVui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/dang-nhap");
      } else {
        const msg = err.response?.data?.message || "Không thể giữ ghế. Vui lòng thử lại.";
        alert(msg);
      }
    } finally {
      setHolding(false);
    }
  };

  const totalAmount = trip ? trip.price * selectedSeats.length : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải thông tin chuyến xe...</p>
      </Container>
    );
  }

  if (error || !trip) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow-sm rounded-4 p-5">
          <div className="text-danger mb-3">
            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
          </div>
          <h4 className="text-danger">Không tìm thấy chuyến xe</h4>
          <Button variant="primary" className="rounded-pill mt-3" onClick={() => navigate("/tuyen-xe")}>
            Quay về danh sách chuyến
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <div className="seat-selection-page">
      <Container className="py-4">
        {/* Nút quay lại */}
        <Button variant="link" className="back-btn mb-4" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </Button>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="route-header">
            <h2 className="fw-bold mb-1">
              <i className="bi bi-ticket-perforated me-2 text-primary"></i>
              Chọn ghế
            </h2>
            <div className="route-path">
              <span className="from">{trip.fromStation}</span>
              <i className="bi bi-arrow-right-short mx-2 text-primary"></i>
              <span className="to">{trip.toStation}</span>
            </div>
          </div>
          <div className="selected-count">
            <Badge bg="primary" className="p-3 rounded-pill fs-6">
              <i className="bi bi-check-circle me-1"></i>
              Đã chọn: <span className="fw-bold">{selectedSeats.length}</span> ghế
            </Badge>
          </div>
        </div>

        <Row className="g-4">
          {/* Cột trái - Sơ đồ ghế */}
          <Col lg={8}>
            <Card className="seat-map-card shadow-sm">
              <Card.Body className="p-4">
                <SeatLayout
                  seats={trip.seats || []}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Cột phải - Thông tin đặt vé */}
          <Col lg={4}>
            <div className="booking-sidebar">
              <Card className="booking-card shadow-sm">
                <div className="booking-header">
                  <i className="bi bi-receipt"></i>
                  <h5 className="mb-0 fw-bold">Thông tin đặt vé</h5>
                </div>
                <Card.Body className="p-4">
                  {/* Tuyến xe */}
                  <div className="info-row">
                    <div className="info-icon">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Tuyến xe</div>
                      <div className="info-value fw-semibold">
                        {trip.fromStation} → {trip.toStation}
                      </div>
                    </div>
                  </div>

                  {/* Thời gian */}
                  <div className="info-row">
                    <div className="info-icon">
                      <i className="bi bi-calendar-event"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Khởi hành</div>
                      <div className="info-value">{formatDate(trip.startTime)}</div>
                    </div>
                  </div>

                  {/* Nhà xe */}
                  <div className="info-row">
                    <div className="info-icon">
                      <i className="bi bi-building"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Nhà xe</div>
                      <div className="info-value">{trip.companyName || "Đang cập nhật"}</div>
                    </div>
                  </div>

                  {/* Giá vé */}
                  <div className="info-row">
                    <div className="info-icon">
                      <i className="bi bi-tag"></i>
                    </div>
                    <div className="info-content">
                      <div className="info-label">Giá vé / ghế</div>
                      <div className="price-value">{formatCurrency(trip.price)}</div>
                    </div>
                  </div>

                  {/* Ghế đã chọn */}
                  <div className="seats-section">
                    <div className="seats-header">
                      <i className="bi bi-chair"></i>
                      <span>Ghế đã chọn ({selectedSeats.length})</span>
                      {selectedSeats.length > 0 && (
                        <button className="clear-all" onClick={() => setSelectedSeats([])}>
                          <i className="bi bi-trash3"></i> Xóa tất cả
                        </button>
                      )}
                    </div>
                    <div className="selected-seats-list">
                      {selectedSeats.length === 0 ? (
                        <div className="empty-seats">
                          <i className="bi bi-inbox"></i>
                          <span>Chưa chọn ghế nào</span>
                        </div>
                      ) : (
                        selectedSeats.map(seat => (
                          <div
                            key={seat.id}
                            className="seat-tag"
                            onClick={() => handleSeatSelect(seat)}
                          >
                            <i className="bi bi-chair-fill text-warning"></i>
                            <span className="fw-semibold">{seat.seatName || seat.name}</span>
                            <i className="bi bi-x-circle ms-auto"></i>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <hr className="my-3" />

                  {/* Tổng tiền */}
                  <div className="total-section">
                    <div className="total-row">
                      <span>Số lượng ghế</span>
                      <span className="fw-bold">{selectedSeats.length}</span>
                    </div>
                    <div className="total-row grand-total">
                      <span>Tổng tiền</span>
                      <span className="h5 text-primary mb-0">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Nút thanh toán */}
                  <Button
                    variant="primary"
                    className="checkout-btn w-100"
                    size="lg"
                    disabled={selectedSeats.length === 0 || holding}
                    onClick={handleHoldSeats}
                  >
                    {holding ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Đang giữ ghế...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right-circle me-2"></i>
                        Tiếp tục thanh toán ({selectedSeats.length} ghế)
                      </>
                    )}
                  </Button>

                  {/* Alert giữ ghế */}
                  <Alert variant="info" className="mt-3 mb-0 small">
                    <i className="bi bi-info-circle me-2"></i>
                    Ghế sẽ được giữ trong <strong>5 phút</strong>. Vui lòng hoàn tất thanh toán trước khi hết hạn.
                  </Alert>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        <style>{`
          .seat-selection-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
          }
          
          .back-btn {
            color: #4361ee;
            font-weight: 500;
            padding: 8px 0;
            text-decoration: none;
          }
          
          .back-btn:hover {
            color: #ff6b35;
          }
          
          .route-header h2 {
            color: #1a1a2e;
          }
          
          .route-path {
            font-size: 1rem;
            color: #6c757d;
          }
          
          .route-path .from, .route-path .to {
            font-weight: 500;
          }
          
          .seat-map-card {
            border: none;
            border-radius: 24px;
            overflow: hidden;
          }
          
          .booking-sidebar {
            position: sticky;
            top: 20px;
          }
          
          .booking-card {
            border: none;
            border-radius: 24px;
            overflow: hidden;
          }
          
          .booking-header {
            background: linear-gradient(135deg, #4361ee, #3a0ca3);
            color: white;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .booking-header i {
            font-size: 1.3rem;
          }
          
          .info-row {
            display: flex;
            gap: 14px;
            margin-bottom: 20px;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .info-icon {
            width: 40px;
            height: 40px;
            background: rgba(67,97,238,0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: #4361ee;
          }
          
          .info-content {
            flex: 1;
          }
          
          .info-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            color: #6c757d;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            font-size: 0.9rem;
            color: #1a1a2e;
          }
          
          .price-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #ff6b35;
          }
          
          .seats-section {
            margin-top: 16px;
          }
          
          .seats-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            color: #6c757d;
            margin-bottom: 12px;
          }
          
          .seats-header i {
            font-size: 0.9rem;
          }
          
          .clear-all {
            margin-left: auto;
            background: none;
            border: none;
            color: #dc3545;
            font-size: 0.75rem;
            cursor: pointer;
          }
          
          .clear-all:hover {
            text-decoration: underline;
          }
          
          .selected-seats-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .empty-seats {
            width: 100%;
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            color: #adb5bd;
          }
          
          .empty-seats i {
            font-size: 1.5rem;
            display: block;
            margin-bottom: 8px;
          }
          
          .seat-tag {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #fff3e0;
            border: 1px solid #ffc107;
            border-radius: 30px;
            padding: 6px 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .seat-tag:hover {
            background: #ffe0b3;
            transform: translateY(-2px);
          }
          
          .total-section {
            background: #f8f9fa;
            border-radius: 16px;
            padding: 16px;
            margin: 8px 0;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          
          .grand-total {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #dee2e6;
            font-size: 1rem;
          }
          
          .checkout-btn {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            border: none;
            padding: 14px;
            font-weight: 600;
            border-radius: 40px;
            transition: transform 0.2s;
          }
          
          .checkout-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            background: linear-gradient(135deg, #e55a2b, #e6851a);
          }
          
          @media (max-width: 768px) {
            .booking-sidebar {
              position: relative;
              top: 0;
            }
            
            .route-header {
              text-align: center;
            }
            
            .route-path {
              font-size: 0.9rem;
            }
          }
        `}</style>
      </Container>
    </div>
  );
}