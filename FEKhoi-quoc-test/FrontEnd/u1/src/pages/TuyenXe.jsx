import { Container, Row, Col, Form, Card, Spinner, Alert } from "react-bootstrap";
import { useSearchParams, useLocation } from "react-router-dom";
import RouteCard from "../components/RouteCard";
import { useState, useEffect } from "react";
import SearchBox from "../components/SearchBox";
import axios from "axios";

export default function TuyenXe() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [priceRange, setPriceRange] = useState(2000000); // max 2 triệu
  const [services, setServices] = useState([]);

  // Lấy params từ URL
  const fromQ = searchParams.get("from") || "";
  const toQ = searchParams.get("to") || "";
  const dateQ = searchParams.get("date") || "";


  // Nếu có kết quả từ state (từ SearchBox), dùng luôn
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        // Nếu có kết quả từ state thì dùng, không thì gọi API
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
    fetchServices();
    fetchRoutes();
  }, [fromQ, toQ, dateQ, location.state]);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/partner/services");
      setServices(res.data);
    } catch (err) {
      console.error("Lỗi lấy services:", err);
    }
  };

  const [selectedServices, setSelectedServices] = useState([]);

  const filteredRoutes = routes.filter(route => {
    const matchPrice = route.price <= priceRange;

    const routeServices = Array.isArray(route.services)
      ? route.services.map(s => s.name)
      : [];

    const matchService =
      selectedServices.length === 0 ||
      selectedServices.every(s => routeServices.includes(s));

    return matchPrice && matchService;
  });

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
      <h3 className="section-title mb-3">Kết quả tìm kiếm</h3>
      <div className="mb-4">
        <SearchBox
          defaultFrom={fromQ}
          defaultTo={toQ}
          defaultDate={dateQ}
        />
      </div>


      <Row>
        {/* ===== SIDEBAR FILTER ===== */}
        <Col md={3}>
          <Card className="p-3 shadow-sm mb-4">
            <h5 className="mb-3">Bộ lọc</h5>

            {/* ===== FILTER GIÁ ===== */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">
                Giá tối đa: {priceRange.toLocaleString('vi-VN')}₫
              </Form.Label>

              <Form.Range
                min={0}
                max={2000000}
                step={50000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />

              <div className="d-flex justify-content-between small text-muted">
                <span>0₫</span>
                <span>2.000.000₫</span>
              </div>
            </Form.Group>

            {/* ===== FILTER SERVICE ===== */}
            <Form.Group>
              <Form.Label className="fw-bold">Tiện ích</Form.Label>

              {services.map((s) => (
                <Form.Check
                  key={s.id}
                  type="checkbox"
                  label={s.name}
                  value={s.name}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedServices([...selectedServices, s.name]);
                    } else {
                      setSelectedServices(selectedServices.filter(x => x !== s.name));
                    }
                  }}
                />
              ))}
            </Form.Group>
          </Card>
        </Col>

        {/* ===== LIST ROUTES ===== */}
        <Col md={9}>
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search fs-1 text-muted"></i>
              <h5>Không tìm thấy chuyến xe</h5>
            </div>
          ) : (
            <>
              <p className="text-muted mb-3">
                Tìm thấy <strong>{filteredRoutes.length}</strong> chuyến xe
              </p>

              <Row className="g-4">
                {filteredRoutes.map((route) => (
                  <Col key={route.id} lg={6}>
                    <RouteCard item={route} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container >
  );
}