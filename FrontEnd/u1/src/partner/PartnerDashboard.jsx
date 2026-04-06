// src/partner/PartnerDashboard.jsx - Sửa import và các icon bị lỗi
import { useNavigate } from "react-router-dom";
import "../styles/PartnerDashboard.css";
import { useEffect, useState } from "react";
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FaBus,
  FaTicketAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarCheck,
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaPercent,
  FaCreditCard,
  FaMoneyBill,
  FaPrint,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaUniversity, // Thay thế cho FaBank
  FaBuilding,    // Thay thế cho FaBank trong một số chỗ
  FaWallet,
  FaReceipt
} from "react-icons/fa";

export default function PartnerDashboard() {
  const [trips, setTrips] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");

  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    totalTickets: 0,
    totalRevenue: 0,
    totalVehicles: 0,
    pendingRefunds: 0,
    completedRefunds: 0,
    occupancyRate: 0,
    popularRoutes: [],
    recentBookings: [],
    revenueByPaymentMethod: {
      cash: 0,
      card: 0,
      bank: 0
    },
    revenueByStatus: {
      paid: 0,
      pending: 0,
      cancelled: 0
    }
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const partnerId = user?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 5;
  const totalPages = Math.ceil(trips.length / tripsPerPage);
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip);

  useEffect(() => {
    if (partnerId) {
      fetchAllData();
    }
  }, [partnerId]);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // Fetch trips
      const tripsRes = await axios.get(
        `http://localhost:5000/api/partner/trips/${partnerId}`
      );
      const tripsData = Array.isArray(tripsRes.data) ? tripsRes.data : [];
      setTrips(tripsData);

      // Fetch vehicles
      const vehiclesRes = await axios.get(
        `http://localhost:5000/api/partner/vehicles/${partnerId}`
      );
      const vehiclesData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      setVehicles(vehiclesData);

      // Fetch tickets
      let ticketsData = [];
      try {
        const ticketsRes = await axios.get("http://localhost:5000/api/partner/tickets", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        console.log("✅ Tickets API response:", ticketsRes.data);

        if (ticketsRes.data?.data && Array.isArray(ticketsRes.data.data)) {
          ticketsData = ticketsRes.data.data;
        } else if (Array.isArray(ticketsRes.data)) {
          ticketsData = ticketsRes.data;
        }
      } catch (err) {
        console.error("Error loading tickets:", err);
        if (tripsData.length > 0) {
          const allBookings = [];
          for (const trip of tripsData.slice(0, 5)) {
            try {
              const bookingsRes = await axios.get(
                `http://localhost:5000/api/partner/trips/${trip.id}/bookings`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
              );
              if (bookingsRes.data?.data && Array.isArray(bookingsRes.data.data)) {
                allBookings.push(...bookingsRes.data.data.map(b => ({ ...b, tripInfo: trip })));
              }
            } catch (e) { }
          }
          ticketsData = allBookings;
        }
      }
      setTickets(ticketsData);

      // Fetch refunds
      let refundsData = [];
      try {
        const refundsRes = await axios.get(
          `http://localhost:5000/api/refunds/partner?status=ALL`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (refundsRes.data?.data && Array.isArray(refundsRes.data.data)) {
          refundsData = refundsRes.data.data;
        }
      } catch (err) { }
      setRefunds(refundsData);

      // Calculate statistics
      calculateStats(tripsData, ticketsData, vehiclesData, refundsData);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tripsData, ticketsData, vehiclesData, refundsData) => {
    const now = new Date();
    const activeTrips = tripsData?.filter(trip => {
      if (!trip.startTime) return false;
      return new Date(trip.startTime) > now;
    }).length || 0;

    // Calculate revenue by payment method and status
    let revenueByPaymentMethod = { cash: 0, card: 0, bank: 0 };
    let revenueByStatus = { paid: 0, pending: 0, cancelled: 0 };
    let totalRevenue = 0;

    ticketsData?.forEach(ticket => {
      const amount = ticket.totalAmount || ticket.price || ticket.amount || 0;
      totalRevenue += amount;

      // By payment method
      const paymentMethod = (ticket.paymentMethod || ticket.payment_method || "cash").toLowerCase();
      if (paymentMethod === "cash") revenueByPaymentMethod.cash += amount;
      else if (paymentMethod === "card") revenueByPaymentMethod.card += amount;
      else if (paymentMethod === "bank" || paymentMethod === "transfer") revenueByPaymentMethod.bank += amount;

      // By status
      const status = (ticket.status || "").toUpperCase();
      if (status === "PAID") revenueByStatus.paid += amount;
      else if (status === "PENDING") revenueByStatus.pending += amount;
      else if (status === "CANCELLED") revenueByStatus.cancelled += amount;
    });

    const pendingRefunds = refundsData?.filter(r => r.status === "PENDING").length || 0;
    const completedRefunds = refundsData?.filter(r => r.status === "APPROVED").length || 0;

    const totalCapacity = (vehiclesData?.length || 1) * 40;
    const occupancyRate = totalCapacity > 0 ? ((ticketsData?.length || 0) / totalCapacity) * 100 : 0;

    // Popular routes
    const routeStats = {};
    tripsData?.forEach(trip => {
      const routeName = trip.routeName || trip.route_name;
      if (routeName) {
        routeStats[routeName] = (routeStats[routeName] || 0) + 1;
      }
    });
    const popularRoutes = Object.entries(routeStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));

    // Recent bookings
    const recentBookings = [...(ticketsData || [])]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);

    setStats({
      totalTrips: tripsData?.length || 0,
      activeTrips,
      totalTickets: ticketsData?.length || 0,
      totalRevenue,
      totalVehicles: vehiclesData?.length || 0,
      pendingRefunds,
      completedRefunds,
      occupancyRate: occupancyRate.toFixed(1),
      popularRoutes,
      recentBookings,
      revenueByPaymentMethod,
      revenueByStatus
    });
  };

  // Filter tickets for modal
  const getFilteredTickets = () => {
    if (ticketFilter === "all") return tickets;
    return tickets.filter(t => {
      const status = (t.status || "").toUpperCase();
      if (ticketFilter === "paid") return status === "PAID";
      if (ticketFilter === "pending") return status === "PENDING" || status === "BOOKED";
      if (ticketFilter === "cancelled") return status === "CANCELLED";
      return true;
    });
  };

  // Filter revenue data
  const getFilteredRevenue = () => {
    if (revenueFilter === "all") return tickets;
    if (revenueFilter === "paid") return tickets.filter(t => (t.status || "").toUpperCase() === "PAID");
    if (revenueFilter === "pending") return tickets.filter(t => (t.status || "").toUpperCase() === "PENDING");
    return tickets;
  };

  const StatCard = ({ title, value, icon, color, onClick, subtitle }) => (
    <div className={`stat-card ${color}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-value">{value}</p>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    switch ((status || "").toUpperCase()) {
      case "PAID": return <Badge bg="success"><FaCheckCircle className="me-1" /> Đã thanh toán</Badge>;
      case "BOOKED": return <Badge bg="warning"><FaHourglassHalf className="me-1" /> Đã đặt</Badge>;
      case "PENDING": return <Badge bg="warning"><FaHourglassHalf className="me-1" /> Chờ thanh toán</Badge>;
      case "USED": return <Badge bg="primary">Đã sử dụng</Badge>;
      case "CANCELLED": return <Badge bg="danger"><FaTimesCircle className="me-1" /> Đã hủy</Badge>;
      default: return <Badge bg="secondary">{status || "N/A"}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method) => {
    const m = (method || "").toLowerCase();
    if (m === "cash") return <FaMoneyBill />;
    if (m === "card") return <FaCreditCard />;
    if (m === "bank" || m === "transfer") return <FaUniversity />;
    return <FaWallet />;
  };

  const getPaymentMethodName = (method) => {
    const m = (method || "").toLowerCase();
    if (m === "cash") return "Tiền mặt";
    if (m === "card") return "Thẻ tín dụng";
    if (m === "bank" || m === "transfer") return "Chuyển khoản";
    return "Khác";
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const viewTicketDetail = async (ticket) => {
    try {
      const id = ticket.ticketId || ticket.id;

      const res = await axios.get(
        `http://localhost:5000/api/tickets/verify/${id}`
      );

      console.log("🎯 Ticket detail:", res.data);

      if (res.data?.data) {
        setSelectedTicket(res.data.data); // data full từ API verify
      } else {
        setSelectedTicket(res.data);
      }

      setShowTicketDetailModal(true);
    } catch (err) {
      console.error("❌ Error fetching ticket detail:", err);

      // fallback: dùng data cũ nếu API lỗi
      setSelectedTicket(ticket);
      setShowTicketDetailModal(true);
    }
  };

  // Revenue Modal
  const RevenueModal = () => {
    const filteredRevenue = getFilteredRevenue();
    const totalFilteredRevenue = filteredRevenue.reduce((sum, t) => sum + (t.totalAmount || t.price || t.amount || 0), 0);

    return (
      <Modal show={showRevenueModal} onHide={() => setShowRevenueModal(false)} size="xl" centered>
        <Modal.Header closeButton style={{ background: "#0C4A6E", color: "white" }}>
          <Modal.Title>
            <FaMoneyBillWave className="me-2" />
            Chi tiết doanh thu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center p-3" style={{ background: "#e8f5e9" }}>
                <h6>Tổng doanh thu</h6>
                <h3 style={{ color: "#2e7d32" }}>{totalFilteredRevenue.toLocaleString()} đ</h3>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center p-3" style={{ background: "#e3f2fd" }}>
                <h6>Số giao dịch</h6>
                <h3 style={{ color: "#1565c0" }}>{filteredRevenue.length}</h3>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center p-3" style={{ background: "#fff3e0" }}>
                <h6>Trung bình/đơn</h6>
                <h3 style={{ color: "#ef6c00" }}>
                  {filteredRevenue.length > 0
                    ? Math.round(totalFilteredRevenue / filteredRevenue.length).toLocaleString()
                    : 0} đ
                </h3>
              </Card>
            </Col>
          </Row>

          {/* Filter */}
          <div className="mb-3 d-flex gap-2">
            <Button
              variant={revenueFilter === "all" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setRevenueFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={revenueFilter === "paid" ? "success" : "outline-secondary"}
              size="sm"
              onClick={() => setRevenueFilter("paid")}
            >
              Đã thanh toán
            </Button>
            <Button
              variant={revenueFilter === "pending" ? "warning" : "outline-secondary"}
              size="sm"
              onClick={() => setRevenueFilter("pending")}
            >
              Chờ thanh toán
            </Button>
          </div>

          {/* Revenue by Payment Method */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Doanh thu theo phương thức thanh toán</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center">
                  <FaMoneyBill size={30} color="#4caf50" />
                  <p className="mt-2 mb-0">Tiền mặt</p>
                  <h5>{stats.revenueByPaymentMethod.cash.toLocaleString()} đ</h5>
                </Col>
                <Col md={4} className="text-center">
                  <FaCreditCard size={30} color="#2196f3" />
                  <p className="mt-2 mb-0">Thẻ tín dụng</p>
                  <h5>{stats.revenueByPaymentMethod.card.toLocaleString()} đ</h5>
                </Col>
                <Col md={4} className="text-center">
                  <FaUniversity size={30} color="#ff9800" />
                  <p className="mt-2 mb-0">Chuyển khoản</p>
                  <h5>{stats.revenueByPaymentMethod.bank.toLocaleString()} đ</h5>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Transaction List */}
          <h6 className="mb-3">Danh sách giao dịch</h6>
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead style={{ background: "#f5f5f5" }}>
                <tr>
                  <th>Mã vé</th>
                  <th>Khách hàng</th>
                  <th>Tuyến đường</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredRevenue.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      Chưa có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  filteredRevenue.map((ticket, idx) => (
                    <tr key={idx}>
                      <td>#{ticket.ticketId || ticket.id || idx + 1}</td>
                      <td>{ticket.customerName || ticket.customer_name || "N/A"}</td>
                      <td>{ticket.fromStation || ticket.from_station} → {ticket.toStation || ticket.to_station}</td>
                      <td className="fw-bold" style={{ color: "#2e7d32" }}>
                        {(ticket.totalAmount || ticket.price || ticket.amount || 0).toLocaleString()} đ
                      </td>
                      <td>
                        {getPaymentMethodIcon(ticket.paymentMethod)} {getPaymentMethodName(ticket.paymentMethod)}
                      </td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleString()
                          : ticket.startTime
                            ? new Date(ticket.startTime).toLocaleString()
                            : "N/A"}
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => viewTicketDetail(ticket)}
                        >
                          <FaEye /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRevenueModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleRefresh}>
            <FaDownload className="me-1" /> Xuất báo cáo
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Tickets Modal
  const TicketsModal = () => {
    const filteredTickets = getFilteredTickets();

    return (
      <Modal show={showTicketsModal} onHide={() => setShowTicketsModal(false)} size="xl" centered>
        <Modal.Header closeButton style={{ background: "#0C4A6E", color: "white" }}>
          <Modal.Title>
            <FaTicketAlt className="me-2" />
            Quản lý vé đã bán
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Summary */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center p-2">
                <small>Tổng số vé</small>
                <h4>{tickets.length}</h4>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-2" style={{ background: "#e8f5e9" }}>
                <small>Đã thanh toán</small>
                <h4 style={{ color: "#2e7d32" }}>
                  {tickets.filter(t => (t.status || "").toUpperCase() === "PAID").length}
                </h4>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-2" style={{ background: "#fff3e0" }}>
                <small>Chờ thanh toán</small>
                <h4 style={{ color: "#ef6c00" }}>
                  {tickets.filter(t => (t.status || "").toUpperCase() === "PENDING" || (t.status || "").toUpperCase() === "BOOKED").length}
                </h4>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center p-2" style={{ background: "#ffebee" }}>
                <small>Đã hủy</small>
                <h4 style={{ color: "#c62828" }}>
                  {tickets.filter(t => (t.status || "").toUpperCase() === "CANCELLED").length}
                </h4>
              </Card>
            </Col>
          </Row>

          {/* Filter */}
          <div className="mb-3 d-flex gap-2">
            <Button
              variant={ticketFilter === "all" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setTicketFilter("all")}
            >
              Tất cả ({tickets.length})
            </Button>
            <Button
              variant={ticketFilter === "paid" ? "success" : "outline-secondary"}
              size="sm"
              onClick={() => setTicketFilter("paid")}
            >
              Đã thanh toán ({tickets.filter(t => (t.status || "").toUpperCase() === "PAID").length})
            </Button>
            <Button
              variant={ticketFilter === "pending" ? "warning" : "outline-secondary"}
              size="sm"
              onClick={() => setTicketFilter("pending")}
            >
              Chờ thanh toán ({tickets.filter(t => (t.status || "").toUpperCase() === "PENDING" || (t.status || "").toUpperCase() === "BOOKED").length})
            </Button>
            <Button
              variant={ticketFilter === "cancelled" ? "danger" : "outline-secondary"}
              size="sm"
              onClick={() => setTicketFilter("cancelled")}
            >
              Đã hủy ({tickets.filter(t => (t.status || "").toUpperCase() === "CANCELLED").length})
            </Button>
          </div>

          {/* Tickets Table */}
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead style={{ background: "#f5f5f5" }}>
                <tr>
                  <th>Mã vé</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Tuyến đường</th>
                  <th>Ghế</th>
                  <th>Giờ xuất phát</th>
                  <th>Giá vé</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      Chưa có vé nào
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket, idx) => (
                    <tr key={idx}>
                      <td>#{ticket.ticketId || ticket.id || idx + 1}</td>
                      <td>{ticket.customerName || ticket.customer_name || "N/A"}</td>
                      <td>{ticket.phone || ticket.customer_phone || "N/A"}</td>
                      <td>{ticket.fromStation || ticket.from_station} → {ticket.toStation || ticket.to_station}</td>
                      <td><strong>{ticket.seatName || ticket.seat_number || "N/A"}</strong></td>
                      <td>{ticket.startTime ? new Date(ticket.startTime).toLocaleString() : "N/A"}</td>
                      <td className="fw-bold" style={{ color: "#FF8C42" }}>
                        {(ticket.totalAmount || ticket.price || ticket.amount || 0).toLocaleString()} đ
                      </td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => viewTicketDetail(ticket)}
                        >
                          <FaEye /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTicketsModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleRefresh}>
            <FaPrint className="me-1" /> In danh sách
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Ticket Detail Modal
  const TicketDetailModal = () => {
    if (!selectedTicket) return null;

    return (
      <Modal show={showTicketDetailModal} onHide={() => setShowTicketDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: "#0C4A6E", color: "white" }}>
          <Modal.Title>
            <FaTicketAlt className="me-2" />
            Chi tiết vé #{selectedTicket.ticketId || selectedTicket.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header style={{ background: "#FF8C42", color: "white" }}>
                  <strong>Thông tin khách hàng</strong>
                </Card.Header>
                <Card.Body>
                  <p><strong>Họ tên:</strong> {selectedTicket.customerName || selectedTicket.customer_name || "N/A"}</p>

                  <p><strong>SĐT:</strong>
                    {selectedTicket.phoneNumber
                      || selectedTicket.phone
                      || selectedTicket.customerPhone
                      || "N/A"}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header style={{ background: "#FF8C42", color: "white" }}>
                  <strong>Thông tin chuyến xe</strong>
                </Card.Header>
                <Card.Body>
                  <p><strong>Tuyến:</strong> {selectedTicket.fromStation || selectedTicket.from_station} → {selectedTicket.toStation || selectedTicket.to_station}</p>
                  <p><strong>Ghế:</strong> {selectedTicket.seatName || selectedTicket.seat_number || "N/A"}</p>
                  <p><strong>Giờ xuất phát:</strong> {selectedTicket.startTime ? new Date(selectedTicket.startTime).toLocaleString() : "N/A"}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTicketDetailModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={() => {
            setShowTicketDetailModal(false);
            navigate(`/doi-tac/trip-seats/${selectedTicket.tripId}`);
          }}>
            Xem sơ đồ ghế
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="partner-page text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="partner-page">
      {/* Refresh button */}
      <div className="text-end mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleRefresh}
          style={{ borderRadius: 20 }}
        >
          🔄 Làm mới
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <StatCard
          title="Tổng chuyến"
          value={stats.totalTrips}
          icon={<FaBus />}
          color="blue"
          onClick={() => navigate("/doi-tac/trips")}
          subtitle={`${stats.activeTrips} đang hoạt động`}
        />

        <StatCard
          title="Doanh thu"
          value={stats.totalRevenue > 0 ? `${stats.totalRevenue.toLocaleString()} đ` : "0 đ"}
          icon={<FaMoneyBillWave />}
          color="green"
          onClick={() => setShowRevenueModal(true)}
          subtitle="Nhấn để xem chi tiết →"
        />

        <StatCard
          title="Vé đã bán"
          value={stats.totalTickets}
          icon={<FaTicketAlt />}
          color="orange"
          onClick={() => setShowTicketsModal(true)}
          subtitle="Nhấn để xem danh sách →"
        />

        <StatCard
          title="Xe"
          value={stats.totalVehicles}
          icon={<FaBus />}
          color="purple"
          onClick={() => navigate("/doi-tac/vehicles")}
        />

        <StatCard
          title="Hoàn tiền chờ"
          value={stats.pendingRefunds}
          icon={<FaExclamationTriangle />}
          color="red"
          onClick={() => navigate("/doi-tac/refunds")}
          subtitle={`Đã duyệt: ${stats.completedRefunds}`}
        />

        <StatCard
          title="Tỷ lệ lấp đầy"
          value={`${stats.occupancyRate}%`}
          icon={<FaPercent />}
          color="teal"
          subtitle="Trung bình các chuyến"
        />
      </div>

      {/* POPULAR ROUTES */}
      <div className="analytics-grid">
        <Card className="analytics-card">
          <Card.Header>
            <h5><FaChartLine /> Tuyến đường phổ biến</h5>
          </Card.Header>
          <Card.Body>
            {stats.popularRoutes.length > 0 ? (
              <div className="popular-routes">
                {stats.popularRoutes.map((route, idx) => (
                  <div key={idx} className="route-item">
                    <span className="route-name">{route.route}</span>
                    <div className="route-bar">
                      <div
                        className="route-fill"
                        style={{ width: `${(route.count / Math.max(stats.totalTrips, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="route-count">{route.count} chuyến</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-3">
                Chưa có dữ liệu. Hãy <a href="/doi-tac/create-trip">tạo chuyến xe</a> đầu tiên.
              </p>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* RECENT BOOKINGS */}
      <Card className="table-card">
        <Card.Header>
          <h5><FaUsers /> Đặt vé gần đây</h5>
        </Card.Header>
        <Card.Body>
          {stats.recentBookings.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Mã vé</th>
                  <th>Khách hàng</th>
                  <th>Tuyến đường</th>
                  <th>Thời gian</th>
                  <th>Giá vé</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((ticket, idx) => (
                  <tr key={idx}>
                    <td>#{ticket.ticketId || ticket.id || idx + 1}</td>
                    <td>{ticket.customerName || ticket.customer_name || "N/A"}</td>
                    <td>{ticket.fromStation || ticket.from_station} → {ticket.toStation || ticket.to_station}</td>
                    <td>{ticket.startTime ? new Date(ticket.startTime).toLocaleString() : "N/A"}</td>
                    <td className="price">{(ticket.totalAmount || ticket.price || 0).toLocaleString()} đ</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => viewTicketDetail(ticket)}
                      >
                        <FaEye /> Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">Chưa có đặt vé nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* UPCOMING TRIPS */}
      <div className="table-card">
        <div className="table-header">
          <h3><FaClock /> Chuyến khởi hành sắp tới</h3>
          <Button
            variant="link"
            onClick={() => navigate("/doi-tac/trips")}
            style={{ color: "#FF8C42", textDecoration: "none" }}
          >
            Xem tất cả →
          </Button>
        </div>

        {trips.length > 0 ? (
          <>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tuyến đường</th>
                  <th>Xe</th>
                  <th>Thời gian xuất phát</th>
                  <th>Giá vé</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.id}</td>
                    <td>{trip.routeName || trip.route_name}</td>
                    <td>{trip.vehicleName || trip.vehicle_name}</td>
                    <td>{trip.startTime ? new Date(trip.startTime).toLocaleString() : "N/A"}</td>
                    <td className="price">{trip.price ? trip.price.toLocaleString() + " đ" : "0 đ"}</td>
                    <td>
                      <Badge className={`status-badge ${trip.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`}>
                        {trip.status === "ACTIVE" ? "Đang hoạt động" : (trip.status || "N/A")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Trước</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Sau</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">Chưa có chuyến xe nào</p>
            <Button onClick={() => navigate("/doi-tac/create-trip")} style={{ background: "#FF8C42", border: "none" }}>
              + Tạo chuyến xe đầu tiên
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <RevenueModal />
      <TicketsModal />
      <TicketDetailModal />
    </div>
  );
}