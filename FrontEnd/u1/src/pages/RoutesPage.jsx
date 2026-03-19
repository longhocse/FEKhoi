import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        console.log("🔄 Đang gọi API...");
        
        // Gọi API simple đã hoạt động
        const response = await axios.get('http://localhost:5000/api/trips/simple');
        
        console.log("✅ API response:", response.data);
        
        // API trả về { success: true, count: ..., data: [...] }
        if (response.data.success && response.data.data) {
          setRoutes(response.data.data);
        } else {
          setRoutes([]);
        }
      } catch (err) {
        console.error("❌ Lỗi:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
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

  return (
    <Container className="py-4">
      <h3 className="mb-4">Danh sách chuyến xe ({routes.length})</h3>
      
      {routes.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
          <h5>Không có chuyến xe nào</h5>
        </div>
      ) : (
        <Row className="g-4">
          {routes.map((trip) => (
            <Col key={trip.id} lg={4} md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    {trip.fromStationId} → {trip.toStationId}
                  </Card.Title>
                  <Card.Text>
                    <strong>Giá:</strong> {trip.price?.toLocaleString()}đ<br/>
                    <strong>Thời gian:</strong> {new Date(trip.startTime).toLocaleString('vi-VN')}<br/>
                    <strong>Thời lượng:</strong> {trip.estimatedDuration} phút
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}