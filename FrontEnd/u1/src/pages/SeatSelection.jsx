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
  const [holding, setHolding] = useState(false);   // Trạng thái đang giữ ghế

  // Load dữ liệu chuyến xe
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

  // Xử lý chọn / bỏ chọn ghế
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

  // Giữ ghế (call API holdSeats)
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
    console.log("Full Authorization header sẽ là: Bearer " + token.substring(0, 30) + "...");

    const res = await axios.post(
      "http://localhost:5000/api/trips/seat-holds",
      {
        tripId: trip.id,
        seatIds: selectedSeats.map(s => s.id)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`   // ← phải có khoảng trắng sau Bearer
        }
      }
    );

    console.log("✅ Giữ ghế thành công:", res.data);

    // Chuyển sang trang thanh toán
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
        <Card className="p-5">
          <h4 className="text-danger">Không tìm thấy chuyến xe</h4>
          <Button variant="primary" onClick={() => navigate("/tuyen-xe")}>
            Quay về danh sách chuyến
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="link" className="mb-3 text-decoration-none" onClick={() => navigate(-1)}>
        ← Quay lại
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Chọn ghế - {trip.fromStation} → {trip.toStation}</h3>
        <Badge bg="info" className="p-2 fs-6">
          Đã chọn: {selectedSeats.length} ghế
        </Badge>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <SeatLayout
                seats={trip.seats || []}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Thông tin đặt vé</h5>

              <div className="mb-3">
                <small className="text-muted">Tuyến xe</small>
                <p className="fw-bold">{trip.fromStation} → {trip.toStation}</p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Khởi hành</small>
                <p>
                  {new Date(trip.startTime).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Nhà xe</small>
                <p>{trip.companyName || "Đang cập nhật"}</p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Giá vé / ghế</small>
                <p className="h5 text-primary">{formatCurrency(trip.price)}</p>
              </div>

              <div className="mb-3">
                <small className="text-muted">Ghế đã chọn ({selectedSeats.length})</small>
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {selectedSeats.length === 0 ? (
                    <p className="text-muted">Chưa chọn ghế nào</p>
                  ) : (
                    selectedSeats.map(seat => (
                      <Badge
                        key={seat.id}
                        bg="warning"
                        className="p-2 d-flex align-items-center gap-1"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSeatSelect(seat)}
                      >
                        {seat.seatName || seat.name} <i className="bi bi-x-circle"></i>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <hr />

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Số lượng:</span>
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
                disabled={selectedSeats.length === 0 || holding}
                onClick={handleHoldSeats}
              >
                {holding ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Đang giữ ghế...
                  </>
                ) : (
                  `Tiếp tục thanh toán (${selectedSeats.length} ghế)`
                )}
              </Button>

              {selectedSeats.length > 0 && (
                <Button
                  variant="outline-secondary"
                  className="w-100 mt-2"
                  onClick={() => setSelectedSeats([])}
                >
                  Bỏ chọn tất cả
                </Button>
              )}

              <Alert variant="info" className="mt-3 small">
                Ghế sẽ được giữ trong <strong>5 phút</strong>. Vui lòng hoàn tất thanh toán trước khi hết hạn.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}