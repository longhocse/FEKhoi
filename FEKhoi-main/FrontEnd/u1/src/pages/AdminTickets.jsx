import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log("🔄 Đang gọi API tickets...");
      
      const response = await axios.get('http://localhost:5000/api/admin/tickets');
      
      console.log("✅ API response:", response.data);
      
      if (response.data.success) {
        setTickets(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error("❌ Lỗi fetch:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/tickets/status');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy thống kê:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/tickets/${id}/status`, {
        status: newStatus
      });
      fetchTickets();
      fetchStats();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const deleteTicket = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa vé này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/tickets/${id}`);
        fetchTickets();
        fetchStats();
      } catch (err) {
        alert('Lỗi xóa: ' + err.message);
      }
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
    return (price || 0).toLocaleString() + 'đ';
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
          <Button variant="outline-danger" onClick={fetchTickets}>
            Thử lại
          </Button>
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
            <Card className="bg-primary text-white">
              <Card.Body>
                <h6>Tổng số vé</h6>
                <h3>{stats.totalTickets || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-success text-white">
              <Card.Body>
                <h6>Đã thanh toán</h6>
                <h3>{stats.paidTickets || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-warning">
              <Card.Body>
                <h6>Chờ thanh toán</h6>
                <h3>{stats.bookedTickets || 0}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-info text-white">
              <Card.Body>
                <h6>Doanh thu</h6>
                <h3>{formatPrice(stats.totalRevenue)}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="BOOKED">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="USED">Đã sử dụng</option>
            <option value="CANCELLED">Đã hủy</option>
          </Form.Select>
        </Col>
        <Col className="text-end">
          <p className="text-muted">Tổng số: {filteredTickets.length} vé</p>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table hover responsive striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Hành khách</th>
                <th>Tuyến xe</th>
                <th>Ghế</th>
                <th>Giá vé</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    Không có vé nào
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <tr key={ticket.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="fw-bold">{ticket.customerName || 'Khách vãng lai'}</div>
                      <div className="small text-muted">{ticket.customerEmail}</div>
                      <div className="small text-muted">{ticket.customerPhone}</div>
                    </td>
                    <td>
                      <div>{ticket.passengerName || ticket.customerName}</div>
                      <div className="small text-muted">{ticket.passengerPhone}</div>
                      <div className="small text-muted">{ticket.passengerEmail}</div>
                    </td>
                    <td>
                      <div className="fw-bold">{ticket.fromStation || 'N/A'} → {ticket.toStation || 'N/A'}</div>
                      <div className="small text-muted">
                        {formatDate(ticket.startTime)}
                      </div>
                      <div className="small">{ticket.companyName || 'N/A'}</div>
                    </td>
                    <td>
                      <Badge bg="info">
                        {ticket.seatName || 'A1'} (Tầng {ticket.seatFloor || 1})
                      </Badge>
                      <div className="small text-muted">{ticket.seatType || 'NORMAL'}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">
                        {formatPrice(ticket.totalAmount)}
                      </div>
                      <div className="small text-muted">
                        {ticket.paymentMethod || 'N/A'}
                      </div>
                    </td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      <div className="small">
                        {formatDate(ticket.bookedAt)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
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
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => deleteTicket(ticket.id)}
                          title="Xóa vé"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}