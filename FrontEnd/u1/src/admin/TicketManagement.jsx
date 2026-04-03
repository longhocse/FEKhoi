import React, { useEffect, useState } from "react";
import axios from "axios";
import { Badge, Button, Spinner, Alert } from "react-bootstrap";

function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/tickets/admin/all`, {
        headers: getHeaders()
      });

      console.log("Dữ liệu vé:", res.data);

      if (res.data.success) {
        setTickets(res.data.data || []);
      } else {
        setError(res.data.message || "Không thể tải danh sách vé");
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách vé:", error);
      setError(error.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/tickets/admin/${id}/status`,
        { status },
        { headers: getHeaders() }
      );
      fetchTickets();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'BOOKED': { bg: 'warning', text: 'Chờ thanh toán' },
      'PAID': { bg: 'success', text: 'Đã thanh toán' },
      'CANCELLED': { bg: 'danger', text: 'Đã hủy' },
      'USED': { bg: 'secondary', text: 'Đã sử dụng' }
    };
    const info = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={info.bg}>{info.text}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải danh sách vé...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchTickets}>
            Thử lại
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Quản lý vé</h3>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Tuyến xe</th>
              <th>Ghế</th>
              <th>Giá vé</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  Không có vé nào
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td className="fw-bold">#{ticket.id}</td>
                  <td>
                    <div>{ticket.userName || "Khách vãng lai"}</div>
                    <small className="text-muted">{ticket.userEmail || ""}</small>
                  </td>
                  <td>
                    <div>{ticket.fromStation || "N/A"} → {ticket.toStation || "N/A"}</div>
                    <small className="text-muted">
                      {ticket.startTime ? new Date(ticket.startTime).toLocaleString('vi-VN') : ""}
                    </small>
                  </td>
                  <td>
                    <Badge bg="info">{ticket.seatName || "N/A"}</Badge>
                    <div><small>{ticket.seatType || "NORMAL"}</small></div>
                  </td>
                  <td className="fw-bold text-primary">
                    {formatCurrency(ticket.totalAmount || ticket.ticketAmount || 0)}
                  </td>
                  <td>
                    {ticket.paymentMethod === 'WALLET' && <Badge bg="success">💳 Ví</Badge>}
                    {ticket.paymentMethod === 'BANKING' && <Badge bg="info">🏦 Chuyển khoản</Badge>}
                    {ticket.paymentMethod === 'CASH' && <Badge bg="secondary">💰 Tiền mặt</Badge>}
                    {!ticket.paymentMethod && <Badge bg="light">N/A</Badge>}
                  </td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td>
                    <small>
                      {ticket.bookedAt ? new Date(ticket.bookedAt).toLocaleString('vi-VN') : "N/A"}
                    </small>
                  </td>
                  <td>
                    {ticket.status !== 'CANCELLED' && ticket.status !== 'USED' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => changeStatus(ticket.id, "CANCELLED")}
                        title="Hủy vé"
                      >
                        <i className="bi bi-x-circle"></i> Hủy
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketManagement;