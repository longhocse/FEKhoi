// src/pages/Payment.jsx
import { Container, Card, Row, Col, Form, Button, Badge, Spinner, InputGroup, Modal, Alert } from "react-bootstrap";
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

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("Thông báo");
  const [onConfirm, setOnConfirm] = useState(null);

  // ==================== COUNTDOWN 1 PHÚT ====================
  const [timeLeft, setTimeLeft] = useState(60); // 1 phút = 60 giây

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

  // ==================== COUNTDOWN LOGIC ====================
  useEffect(() => {
    if (!trip && !tripData) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showAlert("Thời gian giữ ghế đã hết 1 phút! Ghế đã được nhả.", "Hết thời gian", () => {
            localStorage.removeItem('currentBooking');
            navigate("/"); // Chuyển về trang chủ
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [trip, tripData, navigate]);

  // Format thời gian MM:SS
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

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

  // Load tripData từ state hoặc localStorage
  useEffect(() => {
    if (!trip || (!seatId && !seats)) {
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

  // Áp dụng mã giảm giá (giữ nguyên)
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

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  // Thanh toán qua PayOS
  const handlePayOSPayment = async () => {
    if (timeLeft <= 0) {
      showAlert("Thời gian thanh toán đã hết!", "Hết hạn");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showAlert("Vui lòng đăng nhập để đặt vé", "Yêu cầu đăng nhập", () => {
          navigate("/dang-nhap", { state: { from: location.pathname } });
        });
        return;
      }

      const isMultiple = tripData.seats && tripData.seats.length > 0;
      const seatIds = isMultiple ? tripData.seats.map(s => s.id) : [tripData.seatId];

      // Tạo orderInfo đơn giản
      const orderInfo = `BUSGO_${tripData.trip.fromStation}_${tripData.trip.toStation}`;

      const response = await axios.post(
        "http://localhost:5000/api/payos/create-payment",
        {
          tripId: tripData.trip.id,
          seatIds: seatIds,
          amount: finalTotalAmount,
          orderInfo: orderInfo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Lưu thông tin đặt vé vào localStorage
        const bookingData = {
          trip: tripData.trip,
          seatIds: seatIds,
          seats: tripData.seats,
          totalAmount: finalTotalAmount,
          quantity: seatIds.length,
          discount: appliedDiscount
        };
        localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

        // Chuyển hướng đến PayOS
        window.location.href = response.data.paymentUrl;
      } else {
        showAlert(response.data.message || "Tạo thanh toán thất bại", "Lỗi");
      }
    } catch (err) {
      console.error("Lỗi thanh toán PayOS:", err);
      showAlert(err.response?.data?.message || "Có lỗi xảy ra", "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  // Thanh toán qua ví
  const handleWalletPayment = async () => {
    if (timeLeft <= 0) {
      showAlert("Thời gian thanh toán đã hết!", "Hết hạn");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showAlert("Vui lòng đăng nhập để đặt vé", "Yêu cầu đăng nhập", () => {
          navigate("/dang-nhap", { state: { from: location.pathname } });
        });
        return;
      }

      if (!wallet) {
        showAlert("Không tìm thấy thông tin ví");
        return;
      }
      if (wallet.isLocked) {
        showAlert("Ví đang bị khóa, không thể thanh toán");
        return;
      }
      if (wallet.balance < finalTotalAmount) {
        showAlert(`Số dư không đủ. Số dư hiện tại: ${formatCurrency(wallet.balance)}`);
        return;
      }

      const isMultiple = tripData.seats && tripData.seats.length > 0;
      const endpoint = isMultiple ? "http://localhost:5000/api/trips/book-multiple" : "http://localhost:5000/api/trips/book";

      let requestBody;
      if (isMultiple) {
        requestBody = {
          tripId: tripData.trip.id,
          seatIds: tripData.seats.map(s => s.id),
          paymentMethod: 'WALLET',
          discountCode: appliedDiscount?.promotion?.code || null
        };
      } else {
        requestBody = {
          tripId: tripData.trip.id,
          seatId: tripData.seatId,
          paymentMethod: 'WALLET',
          discountCode: appliedDiscount?.promotion?.code || null
        };
      }

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
        localStorage.removeItem('currentBooking');
        showAlert(`Đặt thành công! Đã trừ ${formatCurrency(finalTotalAmount)} từ ví.`, "Thành công", () => {
          if (data.ticketId) {
            navigate(`/ticket/${data.ticketId}`);
          }
          if (data.data?.tickets?.length > 0) {
            navigate(`/ticket-group/${data.data.groupId}`);
          }
        });
      } else {
        showAlert(data.message || "Đặt vé thất bại", "Lỗi");
      }
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      showAlert("Lỗi kết nối đến server", "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (method === "wallet") {
      handleWalletPayment();
    } else if (method === "payos") {
      handlePayOSPayment();
    } else {
      // Tiền mặt
      handleCashPayment();
    }
  };

  // Thanh toán tiền mặt
  const handleCashPayment = async () => {
    if (timeLeft <= 0) {
      showAlert("Thời gian thanh toán đã hết!", "Hết hạn");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showAlert("Vui lòng đăng nhập để đặt vé", "Yêu cầu đăng nhập", () => {
          navigate("/dang-nhap", { state: { from: location.pathname } });
        });
        return;
      }

      const isMultiple = tripData.seats && tripData.seats.length > 0;
      const endpoint = isMultiple ? "http://localhost:5000/api/trips/book-multiple" : "http://localhost:5000/api/trips/book";

      let requestBody;
      if (isMultiple) {
        requestBody = {
          tripId: tripData.trip.id,
          seatIds: tripData.seats.map(s => s.id),
          paymentMethod: 'CASH',
          discountCode: appliedDiscount?.promotion?.code || null
        };
      } else {
        requestBody = {
          tripId: tripData.trip.id,
          seatId: tripData.seatId,
          paymentMethod: 'CASH',
          discountCode: appliedDiscount?.promotion?.code || null
        };
      }

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
        localStorage.removeItem('currentBooking');
        showAlert("Đặt vé thành công! Vui lòng thanh toán tiền mặt tại bến xe.", "Thành công", () => {
          navigate("/ve-cua-toi");
        });
      } else {
        showAlert(data.message || "Đặt vé thất bại", "Lỗi");
      }
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      showAlert("Lỗi kết nối đến server", "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const finalQuantity = tripData?.quantity || (tripData?.seats ? tripData.seats.length : 1);
  const originalTotalAmount = tripData?.totalAmount || (tripData?.trip?.price * finalQuantity);
  const displayAmount = finalTotalAmount;

  const getSeatNames = () => {
    if (tripData?.seats && tripData.seats.length > 0) {
      return tripData.seats.map(s => s.name).join(', ');
    }
    return tripData?.seatName || tripData?.seatId || "Không xác định";
  };

  const showAlert = (message, title = "Thông báo", callback = null) => {
    setModalMessage(message);
    setModalTitle(title);
    setOnConfirm(() => callback);
    setShowModal(true);
  };

  if (!tripData) {
    return (
          <Container className="py-5 text-center">
            <Card className="shadow-sm rounded-4 p-5">
              <div className="display-1 text-muted mb-4">404</div>
              <h2 className="mb-3">Không tìm thấy thông tin đặt vé</h2>
              <p className="text-muted mb-4">Bạn chưa chọn ghế hoặc phiên làm việc đã hết hạn.</p>
              <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" className="rounded-pill px-4" onClick={() => navigate('/tuyen-xe')}>
              Tìm chuyến xe
            </Button>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </div >
        </Card >
      </Container >
    );
  }

  return (
    <div className="payment-page">
      <Container className="py-4" style={{ maxWidth: 1000 }}>
        {/* Countdown Timer */}
        <div className="countdown-wrapper">
          <div className={`countdown-timer ${timeLeft <= 60 ? 'warning' : ''}`}>
            <i className="bi bi-clock-history me-2"></i>
            <span>Thời gian còn lại: </span>
            <strong>{formatTime(timeLeft)}</strong>
          </div>
          <p className="countdown-note">
            Ghế đang được giữ trong 5 phút. Vui lòng hoàn tất thanh toán trước khi hết hạn.
          </p>
        </div>

        <div className="text-center mb-5">
          <h1 className="fw-bold mb-2">
            <i className="bi bi-credit-card me-2 text-primary"></i>
            Thanh toán
          </h1>
          <p className="text-muted">Chọn phương thức thanh toán để hoàn tất đặt vé</p>
        </div>

        <Row className="g-5">
          {/* Cột trái - Phương thức thanh toán */}
          <Col lg={7}>
            {/* Wallet Info */}
            {wallet && (
              <Card className="wallet-card mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted text-uppercase">Số dư ví điện tử</small>
                      <div className="wallet-balance">{formatCurrency(wallet.balance)}</div>
                    </div>
                    {method === "wallet" && wallet.balance < displayAmount && (
                      <Badge bg="danger" className="rounded-pill px-3 py-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Số dư không đủ
                      </Badge>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Payment Methods - Làm rộng rãi hơn */}
            <Card className="payment-methods-card mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
                  Phương thức thanh toán
                </h5>

                <div className="payment-methods-grid">
                  {/* Phương thức 1: Tiền mặt */}
                  <div
                    className={`payment-method-item ${method === "cash" ? "active" : ""}`}
                    onClick={() => setMethod("cash")}
                  >
                    <div className="payment-method-icon cash">
                      <i className="bi bi-cash-stack"></i>
                    </div>
                    <div className="payment-method-info">
                      <div className="payment-method-name">Tiền mặt</div>
                      <div className="payment-method-desc">Thanh toán trực tiếp tại bến xe</div>
                    </div>
                    <div className="payment-method-check">
                      {method === "cash" && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>

                  {/* Phương thức 2: Ví điện tử */}
                  <div
                    className={`payment-method-item ${method === "wallet" ? "active" : ""}`}
                    onClick={() => setMethod("wallet")}
                  >
                    <div className="payment-method-icon wallet">
                      <i className="bi bi-wallet2"></i>
                    </div>
                    <div className="payment-method-info">
                      <div className="payment-method-name">Ví điện tử</div>
                      <div className="payment-method-desc">Thanh toán bằng số dư trong ví</div>
                    </div>
                    <div className="payment-method-check">
                      {method === "wallet" && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>

                  {/* Phương thức 3: PayOS */}
                  <div
                    className={`payment-method-item ${method === "payos" ? "active" : ""}`}
                    onClick={() => setMethod("payos")}
                  >
                    <div className="payment-method-icon payos">
                      <i className="bi bi-credit-card"></i>
                    </div>
                    <div className="payment-method-info">
                      <div className="payment-method-name">PayOS</div>
                      <div className="payment-method-desc">QR Code / Chuyển khoản ngân hàng</div>
                    </div>
                    <div className="payment-method-check">
                      {method === "payos" && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                </div>

                {/* Method Details - Chi tiết từng phương thức */}
                <div className="method-detail-section mt-4">
                  {method === "cash" && (
                    <div className="method-detail cash-detail">
                      <i className="bi bi-cash-stack fs-1 text-primary mb-3 d-block"></i>
                      <p className="mb-2">Thanh toán trực tiếp bằng tiền mặt tại:</p>
                      <ul className="text-muted">
                        <li>Quầy bán vé tại bến xe</li>
                        <li>Trên xe khi lên xe</li>
                      </ul>
                      <div className="alert alert-info mt-2 mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Vui lòng thanh toán đúng số tiền và giữ vé để đối chiếu.
                      </div>
                    </div>
                  )}

                  {method === "wallet" && (
                    <div className="method-detail wallet-detail">
                      <i className="bi bi-wallet2 fs-1 text-primary mb-3 d-block"></i>
                      <p className="mb-2">Thanh toán bằng ví điện tử BUSGO</p>
                      {wallet && (
                        <div className="mt-3 p-3 bg-light rounded-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Số dư hiện tại:</span>
                            <strong className="text-primary">{formatCurrency(wallet.balance)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Số tiền thanh toán:</span>
                            <strong>{formatCurrency(displayAmount)}</strong>
                          </div>
                          <div className="d-flex justify-content-between pt-2 border-top">
                            <span>Số dư sau thanh toán:</span>
                            <strong className={wallet.balance - displayAmount >= 0 ? "text-success" : "text-danger"}>
                              {formatCurrency(wallet.balance - displayAmount)}
                            </strong>
                          </div>
                        </div>
                      )}
                      {wallet && wallet.balance < displayAmount && (
                        <div className="alert alert-warning mt-3">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Số dư không đủ. Vui lòng nạp thêm hoặc chọn phương thức khác.
                        </div>
                      )}
                    </div>
                  )}

                  {method === "payos" && (
                    <div className="method-detail payos-detail">
                      <i className="bi bi-credit-card fs-1 text-primary mb-3 d-block"></i>
                      <p className="mb-3">Thanh toán qua PayOS - Hỗ trợ nhiều phương thức:</p>
                      <div className="bank-grid mb-3">
                        <div className="bank-item"><i className="bi bi-bank me-2"></i>Vietcombank</div>
                        <div className="bank-item"><i className="bi bi-bank me-2"></i>Techcombank</div>
                        <div className="bank-item"><i className="bi bi-bank me-2"></i>BIDV</div>
                        <div className="bank-item"><i className="bi bi-bank me-2"></i>VietinBank</div>
                        <div className="bank-item"><i className="bi bi-phone me-2"></i>MoMo</div>
                        <div className="bank-item"><i className="bi bi-phone me-2"></i>ZaloPay</div>
                        <div className="bank-item"><i className="bi bi-credit-card me-2"></i>Visa/Mastercard</div>
                        <div className="bank-item"><i className="bi bi-qr-code me-2"></i>QR Code</div>
                      </div>
                      <div className="alert alert-success mt-2 mb-0">
                        <i className="bi bi-shield-check me-2"></i>
                        Giao dịch được bảo mật bởi PayOS. Thanh toán an toàn, nhanh chóng.
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Discount Code */}
            <Card className="discount-card">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-tag-fill me-2 text-warning"></i>
                  Mã giảm giá
                </h5>

                {appliedDiscount ? (
                  <div className="discount-applied">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <Badge bg="success" className="mb-1 rounded-pill">Đã áp dụng</Badge>
                        <div className="fw-bold">Mã: {appliedDiscount.promotion.code}</div>
                        <div className="text-success small">
                          Giảm {appliedDiscount.promotion.discountType === 'PERCENT'
                            ? `${appliedDiscount.promotion.discountValue}%`
                            : formatCurrency(appliedDiscount.promotion.discountValue)}
                        </div>
                        <div className="text-muted small">Tiết kiệm: {formatCurrency(appliedDiscount.discountAmount)}</div>
                      </div>
                      <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={handleRemoveDiscount}>
                        <i className="bi bi-x-lg me-1"></i> Xóa
                      </Button>
                    </div>
                  </div>
                ) : (
                  <InputGroup className="shadow-sm">
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      disabled={discountLoading}
                      className="rounded-start-pill border-0 bg-light"
                    />
                    <Button
                      variant="primary"
                      className="rounded-end-pill"
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !discountCode.trim()}
                    >
                      {discountLoading ? <Spinner size="sm" /> : "Áp dụng"}
                    </Button>
                  </InputGroup>
                )}
                {discountError && (
                  <div className="text-danger small mt-2">
                    <i className="bi bi-exclamation-triangle me-1"></i>{discountError}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Cột phải - Order Summary */}
          <Col lg={5}>
            <div className="order-summary sticky-top" style={{ top: "20px" }}>
              <Card className="summary-card">
                <div className="summary-header">
                  <i className="bi bi-receipt"></i>
                  <h5 className="mb-0 fw-bold">Thông tin đơn hàng</h5>
                </div>
                <Card.Body className="p-4">
                  {/* Route */}
                  <div className="summary-item">
                    <div className="summary-icon">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="summary-content">
                      <div className="summary-label">TUYẾN XE</div>
                      <div className="summary-value fw-semibold">
                        {tripData.trip?.fromStation} → {tripData.trip?.toStation}
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="summary-item">
                    <div className="summary-icon">
                      <i className="bi bi-calendar-event"></i>
                    </div>
                    <div className="summary-content">
                      <div className="summary-label">THỜI GIAN</div>
                      <div className="summary-value">
                        {new Date(tripData.trip?.startTime).toLocaleString('vi-VN', {
                          hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="summary-item">
                    <div className="summary-icon">
                      <i className="bi bi-building"></i>
                    </div>
                    <div className="summary-content">
                      <div className="summary-label">NHÀ XE</div>
                      <div className="summary-value">{tripData.trip?.companyName || 'Nhà xe'}</div>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="summary-item">
                    <div className="summary-icon">
                      <i className="bi bi-chair"></i>
                    </div>
                    <div className="summary-content">
                      <div className="summary-label">GHẾ ĐÃ CHỌN</div>
                      <div className="summary-value">
                        <Badge bg="info" className="rounded-pill px-3 py-2">
                          {getSeatNames()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <hr className="my-3" />

                  {/* Price Breakdown */}
                  <div className="price-breakdown">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tạm tính</span>
                      <span>{formatCurrency(originalTotalAmount)}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Giảm giá</span>
                        <span>- {formatCurrency(appliedDiscount.discountAmount)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between pt-2 border-top mt-2">
                      <span className="fw-bold fs-5">Tổng cộng</span>
                      <span className="fw-bold fs-4 text-primary">{formatCurrency(displayAmount)}</span>
                    </div>
                    {finalQuantity > 1 && (
                      <div className="text-muted small text-center mt-2">
                        ({finalQuantity} vé × {formatCurrency(tripData.trip?.price)})
                      </div>
                    )}
                  </div>

                  {/* Payment Button */}
                  <Button
                    variant="primary"
                    className="checkout-btn w-100 mt-4"
                    size="lg"
                    onClick={handlePayment}
                    disabled={loading || (method === "wallet" && wallet?.balance < displayAmount)}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Xác nhận thanh toán
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="w-100 mt-2 rounded-pill"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered className="rounded-4">
          <Modal.Header closeButton className="border-0 pt-4 px-4">
            <Modal.Title className="fw-bold">
              {modalTitle === "Thành công" ? (
                <><i className="bi bi-check-circle-fill text-success me-2"></i>{modalTitle}</>
              ) : modalTitle === "Lỗi" ? (
                <><i className="bi bi-x-circle-fill text-danger me-2"></i>{modalTitle}</>
              ) : (
                <><i className="bi bi-info-circle-fill text-info me-2"></i>{modalTitle}</>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-2">
            <p className="mb-0">{modalMessage}</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pb-4 px-4">
            <Button variant="primary" className="rounded-pill px-4" onClick={() => {
              setShowModal(false);
              if (onConfirm) onConfirm();
            }}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <style>{`
        .payment-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
        }

        .countdown-wrapper {
          text-align: center;
          margin-bottom: 32px;
        }

        .countdown-timer {
          display: inline-flex;
          align-items: center;
          background: #f8f9fa;
          padding: 12px 32px;
          border-radius: 50px;
          font-size: 1rem;
          color: #333;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .countdown-timer.warning {
          background: #dc3545;
          color: white;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }

        .countdown-timer strong {
          font-size: 1.3rem;
          font-weight: bold;
          margin-left: 8px;
        }

        .countdown-note {
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 12px;
        }

        /* Wallet Card */
        .wallet-card {
          border: none;
          border-radius: 20px;
          background: linear-gradient(135deg, #f8f9fa, #fff);
          border: 1px solid #e9ecef;
          margin-bottom: 24px;
        }

        .wallet-balance {
          font-size: 1.8rem;
          font-weight: bold;
          color: #4361ee;
        }

        /* Payment Methods Grid */
        .payment-methods-card {
          border: none;
          border-radius: 24px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }

        .payment-methods-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .payment-method-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px 16px;
          border: 2px solid #e9ecef;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          position: relative;
        }

        .payment-method-item:hover {
          border-color: #4361ee;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .payment-method-item.active {
          border-color: #4361ee;
          background: linear-gradient(135deg, #f0f4ff, #fff);
          box-shadow: 0 5px 15px rgba(67,97,238,0.15);
        }

        .payment-method-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .payment-method-icon.cash {
          background: rgba(67,97,238,0.1);
          color: #4361ee;
        }

        .payment-method-icon.wallet {
          background: rgba(255,107,53,0.1);
          color: #ff6b35;
        }

        .payment-method-icon.payos {
          background: rgba(40,167,69,0.1);
          color: #28a745;
        }

        .payment-method-name {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 6px;
        }

        .payment-method-desc {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .payment-method-check {
          position: absolute;
          top: 16px;
          right: 16px;
          color: #4361ee;
          font-size: 1.2rem;
        }

        /* Method Detail Section */
        .method-detail-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .method-detail {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 16px;
          text-align: center;
        }

        .bank-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 16px 0;
        }

        .bank-item {
          background: white;
          padding: 10px;
          border-radius: 12px;
          font-size: 0.85rem;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        /* Discount Card */
        .discount-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }

        .discount-applied {
          background: rgba(40,167,69,0.1);
          border-radius: 16px;
          padding: 16px;
        }

        /* Summary Card */
        .summary-card {
          border: none;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }

        .summary-header {
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          color: white;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-header i {
          font-size: 1.4rem;
        }

        .summary-item {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .summary-icon {
          width: 44px;
          height: 44px;
          background: rgba(67,97,238,0.1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #4361ee;
        }

        .summary-content {
          flex: 1;
        }

        .summary-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #6c757d;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .summary-value {
          font-size: 0.95rem;
          color: #1a1a2e;
        }

        .price-breakdown {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 16px;
        }

        .checkout-btn {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border: none;
          border-radius: 50px;
          padding: 14px;
          font-weight: 600;
          font-size: 1rem;
          transition: transform 0.2s;
        }

        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #e55a2b, #e6851a);
        }

        @media (max-width: 768px) {
          .payment-methods-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .payment-method-item {
            flex-direction: row;
            text-align: left;
            gap: 16px;
            padding: 16px;
          }

          .payment-method-icon {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
            margin-bottom: 0;
          }

          .payment-method-check {
            position: static;
            margin-left: auto;
          }

          .bank-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .summary-card {
            margin-top: 24px;
          }
        }
      `}</style>
    </div>
  );
}