import { Container, Card, Row, Col, Form, Button, Badge, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [method, setMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // State cho discount
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // Lấy dữ liệu từ location.state hoặc localStorage
  const { trip, seatId, seatName, totalAmount, seats, quantity } = location.state || {};

  // Kiểm tra xem có phải đặt nhiều ghế không
  const isMultipleSeats = seats && seats.length > 0;
  const displaySeats = isMultipleSeats ? seats : [{ id: seatId, name: seatName }];
  const displayQuantity = isMultipleSeats ? quantity || seats.length : 1;
  const displayTotalAmount = isMultipleSeats ? totalAmount : (totalAmount || trip?.price || 0);

  // Tính tổng tiền sau giảm giá
  const finalTotalAmount = appliedDiscount
    ? displayTotalAmount - appliedDiscount.discountAmount
    : displayTotalAmount;

  // Lấy thông tin ví
  useEffect(() => {
    const fetchWallet = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setWalletLoading(true);
        const response = await axios.get("http://localhost:5000/api/wallets/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setWallet(response.data.data);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin ví:", err);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWallet();
  }, []);

  useEffect(() => {
    // Kiểm tra nếu không có dữ liệu từ state
    if (!trip || (!seatId && !seats)) {
      // Thử lấy từ localStorage
      const savedBooking = localStorage.getItem('currentBooking');
      if (savedBooking) {
        try {
          const parsed = JSON.parse(savedBooking);
          setTripData(parsed);
        } catch (e) {
          console.error('Lỗi parse dữ liệu:', e);
        }
      }
    } else {
      setTripData({ trip, seatId, seatName, totalAmount, seats, quantity });
    }
  }, [trip, seatId, seatName, totalAmount, seats, quantity]);

  // Áp dụng mã giảm giá
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      setDiscountLoading(true);
      setDiscountError("");

      const response = await axios.post(
        "http://localhost:5000/api/admin/promotions/apply",
        { code: discountCode, orderAmount: displayTotalAmount },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data.success) {
        setAppliedDiscount(response.data.data);
        setDiscountError("");
      } else {
        setDiscountError(response.data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (err) {
      setDiscountError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setDiscountLoading(false);
    }
  };

  // Xóa mã giảm giá
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  // Nếu không có dữ liệu
  if (!tripData) {
    return (
      <Container className="py-5 text-center">
        <Card className="soft-card p-5">
          <div className="display-1 text-muted mb-4">404</div>
          <h2 className="mb-3">Không tìm thấy thông tin đặt vé</h2>
          <p className="text-muted mb-4">
            Bạn chưa chọn ghế hoặc phiên làm việc đã hết hạn.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="primary"
              className="pill px-4"
              onClick={() => navigate('/tuyen-xe')}
            >
              Tìm chuyến xe
            </Button>
            <Button
              variant="outline-secondary"
              className="pill px-4"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // Xác định số lượng ghế và tổng tiền
  const finalQuantity = tripData.quantity || (tripData.seats ? tripData.seats.length : 1);
  const originalTotalAmount = tripData.totalAmount || (tripData.trip?.price * finalQuantity);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Kiểm tra đăng nhập
      if (!token) {
        alert("Vui lòng đăng nhập để đặt vé");
        navigate("/dang-nhap", { state: { from: location.pathname } });
        return;
      }

      // Kiểm tra số dư ví nếu chọn thanh toán bằng ví
      if (method === "wallet") {
        if (!wallet) {
          alert("Không tìm thấy thông tin ví");
          return;
        }
        if (wallet.isLocked) {
          alert("Ví đang bị khóa, không thể thanh toán");
          return;
        }
        if (wallet.balance < finalTotalAmount) {
          alert(`Số dư không đủ. Số dư hiện tại: ${formatCurrency(wallet.balance)}`);
          return;
        }
      }

      // Xác định endpoint và body request dựa trên số lượng ghế
      const isMultiple = tripData.seats && tripData.seats.length > 0;
      const endpoint = isMultiple ? "http://localhost:5000/api/trips/book-multiple" : "http://localhost:5000/api/trips/book";

      let requestBody;
      if (isMultiple) {
        requestBody = {
          tripId: tripData.trip.id,
          seatIds: tripData.seats.map(s => s.id),
          paymentMethod: method === 'wallet' ? 'WALLET' : method === 'qr' ? 'BANKING' : 'CASH',
          discountCode: appliedDiscount?.promotion?.code || null
        };
      } else {
        requestBody = {
          tripId: tripData.trip.id,
          seatId: tripData.seatId,
          paymentMethod: method === 'wallet' ? 'WALLET' : method === 'qr' ? 'BANKING' : 'CASH',
          discountCode: appliedDiscount?.promotion?.code || null
        };
      }

      // Gọi API đặt vé
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      if (res.ok) {
        // Xóa dữ liệu tạm
        localStorage.removeItem('currentBooking');

        // Thông báo thành công
        let message = "";
        if (method === "wallet") {
          if (isMultiple) {
            message = `Đặt thành công ${finalQuantity} vé! Đã trừ ${formatCurrency(finalTotalAmount)} từ ví của bạn.`;
          } else {
            message = `Đặt vé thành công! Đã trừ ${formatCurrency(finalTotalAmount)} từ ví của bạn.`;
          }
        } else {
          if (isMultiple) {
            message = `Đặt thành công ${finalQuantity} vé!`;
          } else {
            message = "Đặt vé thành công!";
          }
        }

        if (appliedDiscount) {
          message += ` Đã áp dụng mã ${appliedDiscount.promotion.code}, tiết kiệm ${formatCurrency(appliedDiscount.discountAmount)}.`;
        }

        alert(message);
        // SINGLE ticket
        if (data.ticketId) {
          navigate(`/ticket/${data.ticketId}`);
        }

        // MULTIPLE tickets
        if (data.data?.tickets?.length > 0) {
          navigate(`/ticket-group/${data.data.groupId}`);
        }

        // Chuyển đến trang vé của tôi
        // navigate("/ve-cua-toi");
      } else {
        alert(data.message || "Đặt vé thất bại");
      }
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      alert("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  // Định dạng tiền
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const displayAmount = finalTotalAmount;

  // Lấy danh sách tên ghế để hiển thị
  const getSeatNames = () => {
    if (tripData.seats && tripData.seats.length > 0) {
      return tripData.seats.map(s => s.name).join(', ');
    }
    return tripData.seatName || tripData.seatId;
  };

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <h1 className="mb-4">Phương thức thanh toán</h1>

      {/* Thông tin ví */}
      {wallet && (
        <Card className="soft-card mb-4 p-3 bg-light">
          <Row className="align-items-center">
            <Col>
              <small className="text-muted">Số dư ví</small>
              <div className="fw-bold">{formatCurrency(wallet.balance)}</div>
            </Col>
            {method === "wallet" && wallet.balance < displayAmount && (
              <Col xs="auto">
                <Badge bg="danger">Số dư không đủ</Badge>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Ô thanh toán */}
      <Card className="soft-card mb-4 p-4">
        <h4 className="mb-3">Chọn phương thức thanh toán</h4>

        <div className="text-center mt-4">
          <Row className="mb-4">
            <Col md={4}>
              <Button
                variant={method === "cash" ? "primary" : "outline-primary"}
                className="w-100 py-3"
                onClick={() => setMethod("cash")}
              >
                <i className="bi bi-cash me-2"></i>
                Tiền mặt
              </Button>
            </Col>

            <Col md={4}>
              <Button
                variant={method === "wallet" ? "primary" : "outline-primary"}
                className="w-100 py-3"
                onClick={() => setMethod("wallet")}
                disabled={walletLoading}
              >
                <i className="bi bi-wallet2 me-2"></i>
                Ví điện tử
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
                <div className="text-center">
                  <i className="bi bi-qr-code fs-1 text-muted"></i>
                  <div className="text-muted small mt-2">QR Code</div>
                </div>
              </div>

              <p className="text-muted small mt-2">
                Quét mã QR để thanh toán {formatCurrency(displayAmount)}
              </p>
              <p className="text-muted small">
                Ngân hàng: Vietcombank - STK: 1234567890 - CTK: BUSGO
              </p>
            </>
          )}

          {method === "cash" && (
            <div className="mt-3">
              <i className="bi bi-cash-stack fs-1 text-muted"></i>
              <p className="text-muted mt-2">
                Thanh toán trực tiếp bằng tiền mặt tại bến xe hoặc lên xe.
              </p>
            </div>
          )}

          {method === "wallet" && (
            <div className="mt-3">
              <i className="bi bi-wallet2 fs-1 text-muted"></i>
              <p className="text-muted mt-2">
                Thanh toán bằng ví điện tử BUSGO.
              </p>
              {wallet && (
                <div className="mt-2">
                  <Badge bg={wallet.balance >= displayAmount ? "success" : "danger"}>
                    {wallet.balance >= displayAmount
                      ? "Đủ số dư"
                      : `Cần thêm ${formatCurrency(displayAmount - wallet.balance)}`}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Phần nhập mã giảm giá */}
      <Card className="soft-card mb-4 p-4">
        <h5 className="mb-3">
          <i className="bi bi-tag-fill me-2 text-warning"></i>
          Mã giảm giá
        </h5>

        {appliedDiscount ? (
          <div className="bg-success bg-opacity-10 p-3 rounded">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="success" className="mb-1">Đã áp dụng</Badge>
                <div className="fw-bold">Mã: {appliedDiscount.promotion.code}</div>
                <div className="text-success">
                  Giảm {appliedDiscount.promotion.discountType === 'PERCENT'
                    ? `${appliedDiscount.promotion.discountValue}%`
                    : formatCurrency(appliedDiscount.promotion.discountValue)}
                  {appliedDiscount.promotion.discountType === 'PERCENT' && appliedDiscount.promotion.maxDiscount &&
                    ` (tối đa ${formatCurrency(appliedDiscount.promotion.maxDiscount)})`}
                </div>
                <div className="text-muted small mt-1">
                  Tiết kiệm: {formatCurrency(appliedDiscount.discountAmount)}
                </div>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRemoveDiscount}
              >
                <i className="bi bi-x-lg"></i> Xóa
              </Button>
            </div>
          </div>
        ) : (
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Nhập mã giảm giá"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              disabled={discountLoading}
            />
            <Button
              variant="outline-primary"
              onClick={handleApplyDiscount}
              disabled={discountLoading || !discountCode.trim()}
            >
              {discountLoading ? <Spinner size="sm" /> : "Áp dụng"}
            </Button>
          </InputGroup>
        )}
        {discountError && (
          <div className="text-danger small mt-2">{discountError}</div>
        )}
      </Card>

      {/* Tổng tiền */}
      <Card className="soft-card p-4 bg-light">
        <div className="text-center">
          <div className="text-muted small">Tổng tiền</div>
          {appliedDiscount && (
            <div className="text-muted small text-decoration-line-through">
              {formatCurrency(originalTotalAmount)}
            </div>
          )}
          <div className="display-4 fw-bold text-primary-custom">
            {formatCurrency(displayAmount)}
          </div>
          {appliedDiscount && (
            <div className="text-success small mt-1">
              Đã tiết kiệm {formatCurrency(appliedDiscount.discountAmount)}
            </div>
          )}
          {finalQuantity > 1 && (
            <div className="text-muted small mt-1">
              ({finalQuantity} vé × {formatCurrency(tripData.trip?.price)})
            </div>
          )}
        </div>
      </Card>

      {/* Thông tin đơn hàng */}
      <Card className="soft-card mt-4 p-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <div className="fw-bold mb-2">
              {tripData.trip?.fromStation} → {tripData.trip?.toStation}
            </div>
            <div className="text-muted small">
              <i className="bi bi-calendar3 me-1"></i>
              {new Date(tripData.trip?.startTime).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </div>
          </div>
          <Badge bg="light" text="dark" className="border p-2">
            {formatCurrency(originalTotalAmount)}
          </Badge>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <div className="fw-semibold">{tripData.trip?.companyName || 'Nhà xe'}</div>
            <div className="text-muted small">
              <i className="bi bi-bus-front me-1"></i>
              {tripData.trip?.vehicleName || 'Xe khách'}
            </div>
          </div>
          <Badge bg="info" className="p-2">
            {finalQuantity > 1 ? `${finalQuantity} ghế` : 'Ghế'} : {getSeatNames()}
          </Badge>
        </div>
      </Card>

      {/* Nút điều hướng */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="outline-secondary"
          className="pill px-4"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </Button>
        <Button
          variant="primary"
          className="pill px-5"
          onClick={handlePayment}
          disabled={loading || (method === "wallet" && wallet?.balance < displayAmount)}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Đang xử lý...
            </>
          ) : (
            'Xác nhận thanh toán'
          )}
        </Button>
      </div>
    </Container>
  );
}