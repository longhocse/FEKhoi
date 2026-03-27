import { Container, Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        console.log("🔄 Đang gọi API dashboard...");

        // Log URL đang gọi
        const apiUrl = 'http://localhost:5000/api/admin/dashboard';
        console.log("📌 API URL:", apiUrl);

        const response = await axios.get(apiUrl);

        console.log("✅ Response:", response);
        console.log("✅ Data:", response.data);

        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Server trả về lỗi: " + (response.data.error || "Không xác định"));
        }
      } catch (err) {
        console.error("❌ Chi tiết lỗi:", err);

        if (err.code === 'ECONNREFUSED') {
          setError("Không thể kết nối đến server. Kiểm tra backend đã chạy chưa?");
        } else if (err.response) {
          // Server trả về lỗi
          setError(`Lỗi ${err.response.status}: ${err.response.data.error || err.response.statusText}`);
        } else if (err.request) {
          // Không nhận được response
          setError("Không nhận được phản hồi từ server");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    axios.get("http://localhost:5000/api/admin/recent-users")
      .then(res => {
        setUsers(res.data.data);
      });

    axios.get("http://localhost:5000/api/admin/upcoming-trips")
      .then(res => {
        setTrips(res.data.data || []);
      });

    fetchDashboard();
  }, []);

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
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Không có dữ liệu</Alert>
      </Container>
    );
  }

  const stats = [
    {
      title: 'Người dùng',
      value: dashboardData.totalUsers || 0,
      icon: 'bi-people',
      color: 'primary',
      bgColor: '#e6f2ff'
    },
    {
      title: 'Nhà xe',
      value: dashboardData.totalPartners || 0,
      icon: 'bi-truck',
      color: 'success',
      bgColor: '#e6ffe6'
    },
    {
      title: 'Chuyến xe',
      value: dashboardData.totalTrips || 0,
      icon: 'bi-bus-front',
      color: 'info',
      bgColor: '#e6f9ff'
    },
    {
      title: 'Doanh thu',
      value: (dashboardData.totalRevenue || 0).toLocaleString() + 'đ',
      icon: 'bi-cash-stack',
      color: 'warning',
      bgColor: '#fff3e6'
    },
    {
      title: 'Vé đã bán',
      value: dashboardData.totalTickets || 0,
      icon: 'bi-ticket-perforated',
      color: 'danger',
      bgColor: '#ffe6e6'
    },
  ];

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Dashboard</h2>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} md={6} lg={4} xl={3}>
            <Card className="shadow-sm h-100 border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">{stat.title}</h6>
                    <h3 className="mb-0 fw-bold">{stat.value}</h3>
                  </div>
                  <div
                    style={{
                      backgroundColor: stat.bgColor,
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className={`bi ${stat.icon} fs-1 text-${stat.color}`}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Data */}
      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Người dùng mới nhất</h5>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Chuyến xe sắp khởi hành</h5>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Tuyến</th>
                    <th>Giờ</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    trips.map(trip => (
                      <tr key={trip.id}>
                        <td>{trip.fromStation} → {trip.toStation}</td>
                        <td>
                          {new Date(trip.startTime).toLocaleString("vi-VN")}
                        </td>
                        <td>
                          {Number(trip.price).toLocaleString()}đ
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      {/* Debug info - có thể xóa sau */}
      <Card className="mt-4 bg-light">
        <Card.Body>
          <h6>Debug Info:</h6>
          <pre className="mb-0 small">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </Card.Body>
      </Card>
    </Container>
  );
}