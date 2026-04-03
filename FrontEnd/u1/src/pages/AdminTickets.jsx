import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log("🔄 Đang gọi API tickets...");

      // SỬA: Gọi đúng endpoint
      const response = await axios.get(`${API_URL}/tickets/admin/all`, {
        headers: getHeaders()
      });

      console.log("✅ API response:", response.data);

      if (response.data.success) {
        setTickets(response.data.data || []);
        setError(null);
      } else {
        setError(response.data.message || "Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("❌ Lỗi fetch:", err);
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Không thể kết nối đến server. Kiểm tra backend đã chạy chưa.");
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Tính thống kê từ dữ liệu đã có
      if (tickets.length > 0) {
        const totalTickets = tickets.length;
        const paidTickets = tickets.filter(t => t.status === 'PAID').length;
        const bookedTickets = tickets.filter(t => t.status === 'BOOKED').length;
        const totalRevenue = tickets
          .filter(t => t.status === 'PAID')
          .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

        setStats({
          totalTickets,
          paidTickets,
          bookedTickets,
          totalRevenue
        });
      }
    } catch (err) {
      console.error("Lỗi tính thống kê:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [tickets]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/tickets/admin/${id}/status`,
        { status: newStatus },
        { headers: getHeaders() }
      );
      fetchTickets();
    } catch (err) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredTickets = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter);

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
        <p className="mt-3">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={fetchTickets}>
              Thử lại
            </Button>
            <Button variant="outline-secondary" onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Quản lý vé</h2>

      {/* Thống kê */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="bg-primary text-white shadow-sm">
              <Card.Body>
                <h6 className="mb-2">Tổng số vé</h6>
                <h2 className="mb-0">{stats.totalTickets || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-success text-white shadow-sm">
              <Card.Body>
                <h6 className="mb-2">Đã thanh toán</h6>
                <h2 className="mb-0">{stats.paidTickets || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-warning text-dark shadow-sm">
              <Card.Body>
                <h6 className="mb-2">Chờ thanh toán</h6>
                <h2 className="mb-0">{stats.bookedTickets || 0}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-info text-white shadow-sm">
              <Card.Body>
                <h6 className="mb-2">Doanh thu</h6>
                <h3 className="mb-0">{formatPrice(stats.totalRevenue)}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <Form.Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-auto"
          >
            <option value="all">📋 Tất cả trạng thái</option>
            <option value="BOOKED">⏳ Chờ thanh toán</option>
            <option value="PAID">✅ Đã thanh toán</option>
            <option value="USED">🚌 Đã sử dụng</option>
            <option value="CANCELLED">❌ Đã hủy</option>
          </Form.Select>
        </Col>
        <Col className="text-end">
          <p className="text-muted mb-0">
            <i className="bi bi-ticket-perforated me-1"></i>
            Tổng số: <strong>{filteredTickets.length}</strong> vé
          </p>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '12%' }}>Khách hàng</th>
                  <th style={{ width: '10%' }}>Hành khách</th>
                  <th style={{ width: '20%' }}>Tuyến xe</th>
                  <th style={{ width: '8%' }}>Ghế</th>
                  <th style={{ width: '10%' }}>Giá vé</th>
                  <th style={{ width: '10%' }}>Thanh toán</th>
                  <th style={{ width: '10%' }}>Trạng thái</th>
                  <th style={{ width: '10%' }}>Ngày đặt</th>
                  <th style={{ width: '5%' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted py-5">
                      <i className="bi bi-ticket fs-1 d-block mb-2"></i>
                      Không có vé nào
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket, index) => (
                    <tr key={ticket.id}>
                      <td className="fw-bold">{index + 1}</td>
                      <td>
                        <div className="fw-semibold">{ticket.userName || 'Khách vãng lai'}</div>
                        {ticket.userEmail && (
                          <small className="text-muted d-block">{ticket.userEmail}</small>
                        )}
                        {ticket.userPhone && (
                          <small className="text-muted d-block">{ticket.userPhone}</small>
                        )}
                      </td>
                      <td>
                        <div>{ticket.passengerName || ticket.userName || 'N/A'}</div>
                        {ticket.passengerPhone && (
                          <small className="text-muted d-block">{ticket.passengerPhone}</small>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {ticket.fromStation || 'N/A'} → {ticket.toStation || 'N/A'}
                        </div>
                        {ticket.startTime && (
                          <small className="text-muted d-block">
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(ticket.startTime)}
                          </small>
                        )}
                        {ticket.companyName && (
                          <small className="text-muted d-block">
                            🏢 {ticket.companyName}
                          </small>
                        )}
                      </td>
                      <td>
                        <Badge bg="info" className="px-2 py-1">
                          {ticket.seatName || 'N/A'}
                        </Badge>
                        {ticket.seatType && (
                          <div className="small text-muted mt-1">{ticket.seatType}</div>
                        )}
                      </td>
                      <td className="fw-bold text-primary">
                        {formatPrice(ticket.totalAmount)}
                      </td>
                      <td>
                        {ticket.paymentMethod === 'WALLET' && (
                          <Badge bg="success">💳 Ví điện tử</Badge>
                        )}
                        {ticket.paymentMethod === 'BANKING' && (
                          <Badge bg="info">🏦 Chuyển khoản</Badge>
                        )}
                        {ticket.paymentMethod === 'CASH' && (
                          <Badge bg="secondary">💰 Tiền mặt</Badge>
                        )}
                        {!ticket.paymentMethod && <Badge bg="light">N/A</Badge>}
                      </td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>
                        <small className="text-muted">
                          {formatDate(ticket.bookedAt)}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {ticket.status === 'BOOKED' && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => updateStatus(ticket.id, 'PAID')}
                              title="Xác nhận thanh toán"
                            >
                              <i className="bi bi-check-lg"></i>
                            </Button>
                          )}
                          {ticket.status === 'PAID' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateStatus(ticket.id, 'USED')}
                              title="Đã lên xe"
                            >
                              <i className="bi bi-check2-all"></i>
                            </Button>
                          )}
                          {ticket.status !== 'CANCELLED' && ticket.status !== 'USED' && (
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => updateStatus(ticket.id, 'CANCELLED')}
                              title="Hủy vé"
                            >
                              <i className="bi bi-x-lg"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}