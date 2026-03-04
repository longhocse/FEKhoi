import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner
} from "react-bootstrap";
import {
  PeopleFill,
  Truck,
  GeoAltFill,
  CashStack
} from "react-bootstrap-icons";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    totalTrips: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/dashboard")
      .then(res => res.json())
      .then(data => {
        setStats({
          totalUsers: data.totalUsers || 0,
          totalPartners: data.totalPartners || 0,
          totalTrips: data.totalTrips || 0,
          revenue: data.revenue || 0
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dashboard:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Container className="mt-4">

      {/* ===== STATS CARDS ===== */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <PeopleFill size={30} className="text-primary mb-2" />
              <h4>{loading ? <Spinner size="sm" /> : stats.totalUsers}</h4>
              <p className="text-muted">Người dùng</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <Truck size={30} className="text-success mb-2" />
              <h4>{loading ? <Spinner size="sm" /> : stats.totalPartners}</h4>
              <p className="text-muted">Nhà xe</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <GeoAltFill size={30} className="text-warning mb-2" />
              <h4>{loading ? <Spinner size="sm" /> : stats.totalTrips}</h4>
              <p className="text-muted">Chuyến xe</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body>
              <CashStack size={30} className="text-danger mb-2" />
              <h4>
                {loading ? <Spinner size="sm" /> : stats.revenue.toLocaleString()} đ
              </h4>
              <p className="text-muted">Doanh thu</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== RECENT BOOKINGS ===== */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Card.Title>Vé đặt gần đây</Card.Title>

          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Mã vé</th>
                <th>Khách</th>
                <th>Tuyến</th>
                <th>Giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  Chưa có dữ liệu
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

    </Container>
  );
}