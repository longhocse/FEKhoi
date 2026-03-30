import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [groupedTickets, setGroupedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho refund
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundInfo, setRefundInfo] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refunds, setRefunds] = useState([]);

  // State cho review (chỉ đánh giá nhà xe)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [processingReview, setProcessingReview] = useState(false);

  // State cho report
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportCategory, setReportCategory] = useState("SERVICE");
  const [reportDescription, setReportDescription] = useState("");
  const [processingReport, setProcessingReport] = useState(false);

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

      let refundsData = [];
      try {
        const refundsResponse = await axios.get(`${API_URL}/refunds/my-refunds`, {
          headers: getHeaders(),
        });
        refundsData = refundsResponse.data.data || [];
      } catch (refundErr) {
        console.log("Không thể lấy thông tin hoàn tiền:", refundErr);
      }

      setRefunds(refundsData);

      if (ticketsResponse.data.success) {
        const ticketsData = ticketsResponse.data.data || [];
        setTickets(ticketsData);
        const grouped = groupTicketsByBooking(ticketsData);
        setGroupedTickets(grouped);
        setError("");
      } else {
        setError(ticketsResponse.data.message || "Không thể tải danh sách vé");
      }
    } catch (err) {
      console.error("❌ Lỗi tải vé:", err);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const groupTicketsByBooking = (ticketsList) => {
    const groups = {};
    ticketsList.forEach(ticket => {
      const groupKey = ticket.groupId || ticket.transactionId || `booking_${ticket.bookedAt}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          groupId: ticket.groupId,
          transactionId: ticket.transactionId,
          bookedAt: ticket.bookedAt,
          totalAmount: 0,
          tickets: [],
          paymentMethod: ticket.paymentMethod,
          status: ticket.status
        };
      }
      groups[groupKey].tickets.push(ticket);
      groups[groupKey].totalAmount += ticket.totalAmount;
    });
    return Object.values(groups).sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
  };

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
      canRefund: refundAmount > 0 && ticket.status === 'PAID'
    };
  };

  const handleRequestRefund = (ticket) => {
    const refundCalc = calculateRefund(ticket);
    setSelectedTicket(ticket);
    setRefundInfo(refundCalc);
    setRefundReason("");
    setShowRefundModal(true);
  };

  const handleSubmitRefund = async () => {
    if (!refundReason.trim()) {
      alert("Vui lòng nhập lý do hoàn tiền");
      return;
    }

    try {
      setProcessingRefund(true);
      const response = await axios.post(
        `${API_URL}/refunds/request`,
        { ticketId: selectedTicket.id, reason: refundReason },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        alert(response.data.message || "Yêu cầu hoàn tiền đã được gửi");
        setShowRefundModal(false);
        fetchData();
      } else {
        alert(response.data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Lỗi gửi yêu cầu hoàn tiền:", err);
      alert(err.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền");
    } finally {
      setProcessingRefund(false);
    }
  };

  // Mở modal đánh giá nhà xe
  const openReviewModal = (companyId, companyName) => {
    setSelectedCompanyId(companyId);
    setSelectedCompanyName(companyName);
    setReviewRating(0);
    setReviewComment("");
    setShowReviewModal(true);
  };

  // Gửi đánh giá nhà xe
  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setProcessingReview(true);
      const response = await axios.post(
        `${API_URL}/company-reviews/create`,
        {
          companyId: selectedCompanyId,
          rating: reviewRating,
          comment: reviewComment
        },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        alert("Cảm ơn bạn đã đánh giá nhà xe!");
        setShowReviewModal(false);
        fetchData();
      } else {
        alert(response.data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      alert(err.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setProcessingReview(false);
    }
  };

  // Mở modal báo cáo
  const openReportModal = (ticket) => {
    setSelectedTicket(ticket);
    setReportTitle("");
    setReportCategory("SERVICE");
    setReportDescription("");
    setShowReportModal(true);
  };

  // Gửi báo cáo
  const handleSubmitReport = async () => {
    if (!reportTitle.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }
    if (!reportDescription.trim()) {
      alert("Vui lòng nhập nội dung");
      return;
    }

    try {
      setProcessingReport(true);
      const response = await axios.post(
        `${API_URL}/reports/create`,
        {
          title: reportTitle,
          category: reportCategory,
          description: reportDescription,
          ticketId: selectedTicket?.id,
          tripId: selectedTicket?.tripId
        },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        alert("Cảm ơn bạn đã báo cáo! Chúng tôi sẽ xử lý trong thời gian sớm nhất.");
        setShowReportModal(false);
      } else {
        alert(response.data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Lỗi gửi báo cáo:", err);
      alert(err.response?.data?.message || "Không thể gửi báo cáo");
    } finally {
      setProcessingReport(false);
    }
  };

  const hasRefundRequest = (ticketId) => {
    return refunds.some(r => r.ticketId === ticketId);
  };

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

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
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
      'PENDING': { bg: 'warning', text: 'Chờ duyệt' },
      'APPROVED': { bg: 'success', text: 'Đã duyệt' },
      'REJECTED': { bg: 'danger', text: 'Từ chối' }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-ticket-perforated me-2"></i>
          Vé đã đặt
        </h2>
        <Badge bg="secondary" className="p-2">
          {tickets.length} vé - {groupedTickets.length} đợt
        </Badge>
      </div>

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
            <Button variant="primary" className="pill px-4" onClick={() => navigate("/tuyen-xe")}>
              <i className="bi bi-search me-2"></i>
              Tìm chuyến xe
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {groupedTickets.map((group, groupIndex) => (
            <Card key={group.key} className="mb-4 shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center flex-wrap">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                  <Badge bg="info" className="me-2">
                    Đợt {groupedTickets.length - groupIndex}
                  </Badge>
                  <span className="fw-bold">{formatDate(group.bookedAt)}</span>
                </div>
                <div className="d-flex gap-3 flex-wrap">
                  <div>
                    <small className="text-muted">Số vé</small>
                    <Badge bg="primary" className="ms-1">{group.tickets.length} vé</Badge>
                  </div>
                  <div>
                    <small className="text-muted">Tổng tiền</small>
                    <span className="fw-bold text-primary ms-1">{formatCurrency(group.totalAmount)}</span>
                  </div>
                  {group.paymentMethod && (
                    <Badge bg="light" text="dark" className="border">
                      {group.paymentMethod === 'WALLET' ? '💳 Ví' :
                        group.paymentMethod === 'BANKING' ? '🏦 Chuyển khoản' : '💰 Tiền mặt'}
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  {group.tickets.map((ticket, idx) => {
                    const refundStatus = getRefundStatus(ticket.id);
                    const canRefund = ticket.status === 'PAID' && !refundStatus;
                    const canReview = (ticket.status === 'USED' || ticket.status === 'PAID') && ticket.companyId;

                    return (
                      <Col key={ticket.id} md={12} className="mb-3">
                        <div className={`border rounded p-3 ${idx !== group.tickets.length - 1 ? 'border-bottom' : ''}`}>
                          <Row className="align-items-center">
                            <Col md={1} className="text-center">
                              <Badge bg="secondary" className="rounded-circle p-2">{idx + 1}</Badge>
                            </Col>
                            <Col md={4}>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                                <div>
                                  <small className="text-muted">Tuyến xe</small>
                                  <div className="fw-bold">
                                    {ticket.fromStation || 'Đang cập nhật'} → {ticket.toStation || 'Đang cập nhật'}
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md={2}>
                              <small className="text-muted">Thời gian</small>
                              <div className="fw-bold">{formatDateShort(ticket.startTime)}</div>
                              <small className="text-muted">
                                {new Date(ticket.startTime).toLocaleTimeString('vi-VN')}
                              </small>
                            </Col>
                            <Col md={2}>
                              <small className="text-muted">Ghế</small>
                              <div><Badge bg="info">{ticket.seatName || 'Chưa xác định'}</Badge></div>
                            </Col>
                            <Col md={2}>
                              <small className="text-muted">Giá vé</small>
                              <div className="fw-bold text-primary">{formatCurrency(ticket.totalAmount)}</div>
                            </Col>
                            <Col md={1}>
                              <div className="d-flex flex-column align-items-center gap-1">
                                {getStatusBadge(ticket.status)}
                                {refundStatus && getRefundStatusBadge(refundStatus)}
                              </div>
                            </Col>
                          </Row>

                          {/* Nút hành động: Hoàn tiền, Đánh giá nhà xe, Báo cáo */}
                          <div className="mt-3 pt-2 border-top d-flex justify-content-end gap-2">
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
                            {canRefund && (
                              <Button variant="outline-warning" size="sm" onClick={() => handleRequestRefund(ticket)}>
                                <i className="bi bi-arrow-return-left me-1"></i> Yêu cầu hoàn tiền
                              </Button>
                            )}

                            {canReview && (
                              <Button variant="outline-info" size="sm" onClick={() => openReviewModal(ticket.companyId, ticket.companyName)}>
                                <i className="bi bi-star me-1"></i> Đánh giá nhà xe
                              </Button>
                            )}

                            <Button variant="outline-secondary" size="sm" onClick={() => openReportModal(ticket)}>
                              <i className="bi bi-flag me-1"></i> Báo cáo
                            </Button>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>

            </Card>
          ))}
        </div>
      )}

      {/* Modal yêu cầu hoàn tiền (giữ nguyên) */}
      <Modal show={showRefundModal} onHide={() => setShowRefundModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-arrow-return-left me-2 text-warning"></i>Yêu cầu hoàn tiền</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && refundInfo && (
            <>
              <div className="bg-light p-3 rounded mb-3">
                <h6 className="mb-3">Thông tin vé</h6>
                <div className="row">
                  <div className="col-md-6 mb-2"><small className="text-muted d-block">Tuyến xe</small><strong>{selectedTicket.fromStation} → {selectedTicket.toStation}</strong></div>
                  <div className="col-md-6 mb-2"><small className="text-muted d-block">Thời gian khởi hành</small><strong>{formatDate(selectedTicket.startTime)}</strong></div>
                  <div className="col-md-6 mb-2"><small className="text-muted d-block">Ghế</small><strong>{selectedTicket.seatName}</strong></div>
                  <div className="col-md-6 mb-2"><small className="text-muted d-block">Giá vé</small><strong>{formatCurrency(selectedTicket.totalAmount)}</strong></div>
                </div>
              </div>
              <div className={`p-3 rounded mb-3 ${refundInfo.refundPercentage === 100 ? 'bg-success bg-opacity-10' : refundInfo.refundPercentage === 50 ? 'bg-warning bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                <h6 className="mb-3">Thông tin hoàn tiền</h6>
                <div className="mb-2">
                  <div className="d-flex justify-content-between"><span>Thời gian còn lại:</span><strong>{refundInfo.hoursUntilDeparture} giờ</strong></div>
                  <div className="d-flex justify-content-between"><span>Tỷ lệ hoàn:</span><strong className={refundInfo.refundPercentage === 100 ? 'text-success' : refundInfo.refundPercentage === 50 ? 'text-warning' : 'text-danger'}>{refundInfo.refundPercentage}%</strong></div>
                  <div className="d-flex justify-content-between"><span>Số tiền được hoàn:</span><strong className="text-primary">{formatCurrency(refundInfo.refundAmount)}</strong></div>
                  <div className="d-flex justify-content-between"><span>Mất phí:</span><strong className="text-danger">{formatCurrency(selectedTicket.totalAmount - refundInfo.refundAmount)}</strong></div>
                </div>
                <Alert variant={refundInfo.refundPercentage === 100 ? 'success' : refundInfo.refundPercentage === 50 ? 'warning' : 'danger'} className="mt-2 mb-0 small">
                  <i className={`bi ${refundInfo.refundPercentage === 100 ? 'bi-check-circle' : refundInfo.refundPercentage === 50 ? 'bi-exclamation-triangle' : 'bi-x-circle'} me-2`}></i>{refundInfo.message}
                </Alert>
              </div>
              <Form.Group>
                <Form.Label>Lý do hoàn tiền <span className="text-danger">*</span></Form.Label>
                <Form.Control as="textarea" rows={3} value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Nhập lý do hoàn tiền..." disabled={processingRefund} />
                <Form.Text className="text-muted">Lý do sẽ được xem xét bởi admin trước khi duyệt</Form.Text>
              </Form.Group>
            </>
          )
          }
        </Modal.Body >
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRefundModal(false)} disabled={processingRefund}>Hủy</Button>
          <Button variant="warning" onClick={handleSubmitRefund} disabled={processingRefund || !refundReason.trim()}>
            {processingRefund ? (<><Spinner size="sm" className="me-2" />Đang xử lý...</>) : 'Gửi yêu cầu hoàn tiền'}
          </Button>
        </Modal.Footer>
      </Modal >

      {/* Modal đánh giá nhà xe */}
      < Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered >
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-star-fill text-warning me-2"></i>Đánh giá nhà xe {selectedCompanyName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <i key={star} className={`bi bi-star${star <= reviewRating ? '-fill' : ''} fs-1 ${star <= reviewRating ? 'text-warning' : 'text-secondary'}`} style={{ cursor: 'pointer' }} onClick={() => setReviewRating(star)}></i>
              ))}
            </div>
            <p className="text-muted">{reviewRating === 1 ? 'Rất tệ' : reviewRating === 2 ? 'Tệ' : reviewRating === 3 ? 'Bình thường' : reviewRating === 4 ? 'Tốt' : reviewRating === 5 ? 'Tuyệt vời!' : 'Chọn số sao'}</p>
          </div>
          <Form.Group>
            <Form.Label>Nhận xét của bạn</Form.Label>
            <Form.Control as="textarea" rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Chia sẻ trải nghiệm của bạn về nhà xe..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)} disabled={processingReview}>Hủy</Button>
          <Button variant="warning" onClick={handleSubmitReview} disabled={processingReview || reviewRating === 0}>
            {processingReview ? (<><Spinner size="sm" className="me-2" />Đang gửi...</>) : 'Gửi đánh giá'}
          </Button>
        </Modal.Footer>
      </Modal >

      {/* Modal báo cáo (giữ nguyên) */}
      < Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered size="lg" >
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-flag-fill text-danger me-2"></i>Báo cáo vấn đề</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control type="text" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Nhập tiêu đề ngắn gọn..." />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Loại vấn đề</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              {['TECHNICAL', 'SERVICE', 'PAYMENT', 'OTHER'].map(cat => (
                <Button key={cat} variant={reportCategory === cat ? "primary" : "outline-secondary"} size="sm" onClick={() => setReportCategory(cat)}>
                  {cat === 'TECHNICAL' ? '🔧 Kỹ thuật' : cat === 'SERVICE' ? '🎧 Dịch vụ' : cat === 'PAYMENT' ? '💳 Thanh toán' : '📝 Khác'}
                </Button>
              ))}
            </div>
          </Form.Group>
          <Form.Group>
            <Form.Label>Mô tả chi tiết</Form.Label>
            <Form.Control as="textarea" rows={5} value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Mô tả chi tiết vấn đề bạn gặp phải..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)} disabled={processingReport}>Hủy</Button>
          <Button variant="danger" onClick={handleSubmitReport} disabled={processingReport || !reportTitle.trim() || !reportDescription.trim()}>
            {processingReport ? (<><Spinner size="sm" className="me-2" />Đang gửi...</>) : 'Gửi báo cáo'}
          </Button>
        </Modal.Footer>
      </Modal >
    </Container >
  );
}
