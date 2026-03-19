import { Container, Row, Col, Form, Card, Spinner, Alert } from "react-bootstrap";
import { useSearchParams, useLocation } from "react-router-dom";
import RouteCard from "../components/RouteCard";
import { useState, useEffect } from "react";
import axios from "axios";

export default function RoutesPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState("");

  // Lấy params từ URL
  const fromQ = searchParams.get("from") || "";
  const toQ = searchParams.get("to") || "";
  const dateQ = searchParams.get("date") || "";

  // Gọi API khi component mount hoặc params thay đổi
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        
        // Nếu có kết quả từ state (từ SearchBox), dùng luôn
        if (location.state?.searchResults) {
          console.log("Dùng dữ liệu từ state:", location.state.searchResults);
          setRoutes(location.state.searchResults);
        } else {
          // Gọi API tìm kiếm
          console.log("Gọi API tìm kiếm với params:", { from: fromQ, to: toQ, date: dateQ });
          
          const response = await axios.get('http://localhost:5000/api/search', {
            params: {
              from: fromQ,
              to: toQ,
              date: dateQ
            }
          });
          
          console.log("Kết quả từ API:", response.data);
          setRoutes(response.data.data || []);
        }
        
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu từ server. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ gọi API nếu có ít nhất một tham số tìm kiếm
    if (fromQ || toQ || dateQ || location.state?.searchResults) {
      fetchRoutes();
    } else {
      // Nếu không có tham số tìm kiếm, có thể hiển thị tất cả hoặc thông báo
      setLoading(false);
      setRoutes([]);
    }
  }, [fromQ, toQ, dateQ, location.state]);

  // Lọc theo giá (client-side filter)
  const filteredRoutes = minPrice 
    ? routes.filter(route => route.price >= Number(minPrice))
    : routes;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tìm kiếm chuyến xe...</p>
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
      <h3 className="section-title mb-3">Vé xe khách</h3>

      {/* Hiển thị thông tin tìm kiếm */}
      {(fromQ || toQ || dateQ) && (
        <Card className="bg-light border-0 mb-4">
          <Card.Body>
            <Row>
              {fromQ && (
                <Col md={4}>
                  <strong>Điểm đi:</strong> {fromQ}
                </Col>
              )}
              {toQ && (
                <Col md={4}>
                  <strong>Điểm đến:</strong> {toQ}
                </Col>
              )}
              {dateQ && (
                <Col md={4}>
                  <strong>Ngày đi:</strong> {new Date(dateQ).toLocaleDateString('vi-VN')}
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Bộ lọc giá */}
      <Card className="soft-card p-3 mb-4">
        <Row className="g-2 align-items-center">
          <Col md={3}>
            <Form.Label className="fw-bold mb-0">Lọc theo giá:</Form.Label>
          </Col>
          <Col md={4}>
            <Form.Control
              type="number"
              placeholder="Giá tối thiểu (VNĐ)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </Col>
          <Col md={5}>
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              Để trống để xem tất cả
            </div>
          </Col>
        </Row>
      </Card>

      {/* Kết quả */}
      {filteredRoutes.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
          <h5>Không tìm thấy chuyến xe nào</h5>
          <p className="text-muted">
            {fromQ || toQ || dateQ 
              ? "Vui lòng thử lại với điểm đi, điểm đến hoặc ngày khác."
              : "Vui lòng nhập thông tin tìm kiếm."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-muted mb-3">
            Tìm thấy <strong>{filteredRoutes.length}</strong> chuyến xe
          </p>
          <Row className="g-4">
            {filteredRoutes.map((route) => (
              <Col key={route.id} lg={4} md={6}>
                <RouteCard item={route} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}