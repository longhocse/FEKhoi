import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho modal hoàn tiền
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundInfo, setRefundInfo] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập để xem vé");
        setTimeout(() => navigate("/dang-nhap"), 2000);
        return;
      }

      // Lấy danh sách vé
      console.log("🔄 Đang gọi API lấy vé...");
      const ticketsResponse = await axios.get(`${API_URL}/tickets/my-tickets`, {
        headers: getHeaders(),
      });

      // Lấy danh sách yêu cầu hoàn tiền
      let refundsData = [];
      try {
        const refundsResponse = await axios.get(`${API_URL}/refunds/my-refunds`, {
          headers: getHeaders(),
        });
        refundsData = refundsResponse.data.data || [];
      } catch (refundErr) {
        console.log("Không thể lấy thông tin hoàn tiền:", refundErr);
      }

      console.log("✅ API response:", ticketsResponse.data);

      if (ticketsResponse.data.success) {
        setTickets(ticketsResponse.data.data || []);
        setRefunds(refundsData);
        setError("");

        if (ticketsResponse.data.data.length === 0) {
          console.log("📭 Không có vé nào");
        } else {
          console.log(`🎫 Có ${ticketsResponse.data.data.length} vé`);
        }
      } else {
        setError(ticketsResponse.data.message || "Không thể tải danh sách vé");
      }
    } catch (err) {
      console.error("❌ Lỗi tải vé:", err);

      if (err.code === 'ERR_NETWORK') {
        setError("Không thể kết nối đến server. Kiểm tra backend đã chạy chưa.");
      } else if (err.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/dang-nhap"), 2000);
      } else if (err.response?.status === 404) {
        setError("API không tồn tại. Kiểm tra route /api/tickets/my-tickets");
      } else {
        setError(err.response?.data?.message || "Không thể tải danh sách vé");
      }
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thông tin hoàn tiền
  const calculateRefund = (ticket) => {
    const departureTime = new Date(ticket.startTime);
    const now = new Date();
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

    let refundAmount = 0;
    let refundPercentage = 0;
    let message = '';

    if (hoursUntilDeparture > 48) {
      refundAmount = ticket.totalAmount;
      refundPercentage = 100;
      message = '✅ Hoàn 100% số tiền vé (hủy trước 48 giờ)';
    } else if (hoursUntilDeparture > 0) {
      refundAmount = ticket.totalAmount * 0.5;
      refundPercentage = 50;
      message = '⚠️ Hoàn 50% số tiền vé (hủy sau 48 giờ)';
    } else {
      refundAmount = 0;
      refundPercentage = 0;
      message = '❌ Không được hoàn tiền (đã quá giờ khởi hành)';
    }

    return {
      originalAmount: ticket.totalAmount,
      refundAmount,
      refundPercentage,
      hoursUntilDeparture: Math.round(hoursUntilDeparture * 10) / 10,
      message,
      canRefund: refundAmount > 0
    };
  };

  // Mở modal yêu cầu hoàn tiền
  const handleRequestRefund = (ticket) => {
    const refundCalc = calculateRefund(ticket);
    setSelectedTicket(ticket);
    setRefundInfo(refundCalc);
    setRefundReason("");
    setShowRefundModal(true);
  };

  // Trong hàm handleSubmitRefund
  const handleSubmitRefund = async () => {
    if (!refundReason.trim()) {
      alert("Vui lòng nhập lý do hoàn tiền");
      return;
    }

    try {
      setProcessingRefund(true);

      console.log("🔄 Gửi yêu cầu hoàn tiền:", {
        ticketId: selectedTicket.id,
        reason: refundReason
      });

      const token = localStorage.getItem("token");
      console.log("🔑 Token:", token);

      const response = await axios.post(
        `${API_URL}/refunds/request`,  // Đảm bảo URL đúng
        {
          ticketId: selectedTicket.id,
          reason: refundReason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Response:", response.data);

      if (response.data.success) {
        alert("Yêu cầu hoàn tiền đã được gửi thành công!");
        setShowRefundModal(false);
        fetchData();
      } else {
        alert(response.data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("❌ Lỗi chi tiết:", err);
      console.error("❌ Response:", err.response?.data);

      if (err.code === 'ERR_NETWORK') {
        alert("Không thể kết nối đến server");
      } else if (err.response?.status === 404) {
        alert("API hoàn tiền không tồn tại. Kiểm tra lại backend.");
      } else {
        alert(err.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền");
      }
    } finally {
      setProcessingRefund(false);
    }
  };

  // Kiểm tra xem vé đã có yêu cầu hoàn tiền chưa
  const hasRefundRequest = (ticketId) => {
    return refunds.some(r => r.ticketId === ticketId);
  };

  // Lấy trạng thái hoàn tiền nếu có
  const getRefundStatus = (ticketId) => {
    const refund = refunds.find(r => r.ticketId === ticketId);
    return refund ? refund.status : null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      'BOOKED': { bg: 'warning', text: 'Chờ thanh toán' },
      'PAID': { bg: 'success', text: 'Đã thanh toán' },
      'CANCELLED': { bg: 'danger', text: 'Đã hủy' },
      'USED': { bg: 'secondary', text: 'Đã sử dụng' }
    };

    const statusInfo = statusMap[status] || { bg: 'light', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  const getRefundStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { bg: 'warning', text: 'Đang chờ duyệt' },
      'APPROVED': { bg: 'success', text: 'Đã duyệt' },
      'REJECTED': { bg: 'danger', text: 'Bị từ chối' }
    };
    const info = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={info.bg} className="ms-2">{info.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải danh sách vé...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <i className="bi bi-ticket-perforated me-2"></i>
        Vé đã đặt
      </h2>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={fetchData}>
              Thử lại
            </Button>
          </div>
        </Alert>
      )}

      {!error && tickets.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-ticket fs-1 text-muted d-block mb-3"></i>
            <h5 className="text-muted mb-3">Bạn chưa đặt vé nào</h5>
            <p className="text-muted mb-4">
              Hãy đặt vé ngay để trải nghiệm dịch vụ của chúng tôi
            </p>
            <Button
              variant="primary"
              className="pill px-4"
              onClick={() => navigate("/tuyen-xe")}
            >
              <i className="bi bi-search me-2"></i>
              Tìm chuyến xe
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {tickets.map((ticket) => {
            const refundStatus = getRefundStatus(ticket.id);

            return (
              <Col md={6} lg={4} key={ticket.id} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <strong>Mã vé: #{ticket.id}</strong>
                    <div className="d-flex align-items-center">
                      {getStatusBadge(ticket.status)}
                      {refundStatus && getRefundStatusBadge(refundStatus)}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                        <div>
                          <small className="text-muted">Điểm đi</small>
                          <div className="fw-bold">{ticket.fromStation || 'Đang cập nhật'}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-geo-alt-fill text-success me-2"></i>
                        <div>
                          <small className="text-muted">Điểm đến</small>
                          <div className="fw-bold">{ticket.toStation || 'Đang cập nhật'}</div>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div className="mb-2">
                      <small className="text-muted">Thời gian khởi hành</small>
                      <div className="fw-bold">{formatDate(ticket.startTime)}</div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">Ghế</small>
                      <div>
                        <Badge bg="info">{ticket.seatName || 'Chưa xác định'}</Badge>
                      </div>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">Nhà xe</small>
                      <div>{ticket.companyName || 'Đang cập nhật'}</div>
                    </div>

                    <div className="mt-3">
                      <small className="text-muted">Tổng tiền</small>
                      <h5 className="text-primary mb-0">{formatCurrency(ticket.totalAmount)}</h5>
                    </div>
                  </Card.Body>


                  {ticket.status === 'PAID' && !refundStatus && (
                    <Card.Footer className="bg-white border-0 pb-3">

                      {/* NÚT TRACKING */}
                      {(ticket.status === 'PAID' || ticket.status === 'BOOKED') && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100"
                          onClick={() => navigate(`/tracking/${ticket.tripId}`)}
                        >
                          <i className="bi bi-geo-alt me-2"></i>
                          Theo dõi hành trình
                        </Button>
                      )}
                      {/* Thêm nút yêu cầu hoàn tiền cho vé đã thanh toán và chưa có yêu cầu */}
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="w-100"
                        onClick={() => handleRequestRefund(ticket)}
                      >
                        <i className="bi bi-arrow-return-left me-2"></i>
                        Yêu cầu hoàn tiền
                      </Button>
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal yêu cầu hoàn tiền */}
      <Modal show={showRefundModal} onHide={() => setShowRefundModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-arrow-return-left me-2 text-warning"></i>
            Yêu cầu hoàn tiền
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && refundInfo && (
            <>
              {/* Thông tin vé */}
              <div className="bg-light p-3 rounded mb-3">
                <h6 className="mb-3">Thông tin vé</h6>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <small className="text-muted d-block">Tuyến xe</small>
                    <strong>{selectedTicket.fromStation} → {selectedTicket.toStation}</strong>
                  </div>
                  <div className="col-md-6 mb-2">
                    <small className="text-muted d-block">Thời gian khởi hành</small>
                    <strong>{formatDate(selectedTicket.startTime)}</strong>
                  </div>
                  <div className="col-md-6 mb-2">
                    <small className="text-muted d-block">Ghế</small>
                    <strong>{selectedTicket.seatName}</strong>
                  </div>
                  <div className="col-md-6 mb-2">
                    <small className="text-muted d-block">Giá vé</small>
                    <strong>{formatCurrency(selectedTicket.totalAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* Thông tin hoàn tiền */}
              <div className={`p-3 rounded mb-3 ${refundInfo.refundPercentage === 100 ? 'bg-success bg-opacity-10' :
                refundInfo.refundPercentage === 50 ? 'bg-warning bg-opacity-10' :
                  'bg-danger bg-opacity-10'
                }`}>
                <h6 className="mb-3">Thông tin hoàn tiền</h6>

                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span>Thời gian còn lại:</span>
                    <strong>{refundInfo.hoursUntilDeparture} giờ</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Tỷ lệ hoàn:</span>
                    <strong className={
                      refundInfo.refundPercentage === 100 ? 'text-success' :
                        refundInfo.refundPercentage === 50 ? 'text-warning' :
                          'text-danger'
                    }>
                      {refundInfo.refundPercentage}%
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Số tiền được hoàn:</span>
                    <strong className="text-primary">{formatCurrency(refundInfo.refundAmount)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Mất phí:</span>
                    <strong className="text-danger">{formatCurrency(selectedTicket.totalAmount - refundInfo.refundAmount)}</strong>
                  </div>
                </div>

                <Alert variant={
                  refundInfo.refundPercentage === 100 ? 'success' :
                    refundInfo.refundPercentage === 50 ? 'warning' :
                      'danger'
                } className="mt-2 mb-0 small">
                  <i className={`bi ${refundInfo.refundPercentage === 100 ? 'bi-check-circle' :
                    refundInfo.refundPercentage === 50 ? 'bi-exclamation-triangle' :
                      'bi-x-circle'
                    } me-2`}></i>
                  {refundInfo.message}
                </Alert>
              </div>

              {/* Form lý do */}
              <Form.Group>
                <Form.Label>Lý do hoàn tiền <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Nhập lý do hoàn tiền (ví dụ: thay đổi kế hoạch, bận việc đột xuất, ...)"
                  disabled={processingRefund}
                />
                <Form.Text className="text-muted">
                  Lý do sẽ được xem xét bởi admin trước khi duyệt
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRefundModal(false)} disabled={processingRefund}>
            Hủy
          </Button>
          <Button
            variant="warning"
            onClick={handleSubmitRefund}
            disabled={processingRefund || !refundReason.trim()}
          >
            {processingRefund ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              'Gửi yêu cầu hoàn tiền'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
