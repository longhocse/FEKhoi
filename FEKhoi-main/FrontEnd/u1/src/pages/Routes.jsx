import { Container, Row, Col, Form, Card, InputGroup } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { popularRoutes } from "../data/mockRoutes"; // Lấy tạm dữ liệu ảo ở ../data/mockRoutes
import RouteCard from "../components/RouteCard";
import { useMemo, useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaRegFlag, FaExchangeAlt } from "react-icons/fa";

export default function RoutesPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [from, setFrom] = useState(params.get("from") || "");
  const [to, setTo] = useState(params.get("to") || "");
  const [date, setDate] = useState("");

  const [minPrice, setMinPrice] = useState("");

  const fromQ = (params.get("from") || "").toLowerCase();
  const toQ = (params.get("to") || "").toLowerCase();
  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };
  const handleSearch = () => {
    navigate(`/tuyen-xe?from=${from}&to=${to}&date=${date}`);
  };

  const filtered = useMemo(() => {
    return popularRoutes.filter((r) => {
      const okFrom = !fromQ || r.from.toLowerCase().includes(fromQ);
      const okTo = !toQ || r.to.toLowerCase().includes(toQ);
      const okPrice = !minPrice || r.price >= Number(minPrice);
      return okFrom && okTo && okPrice;
    });
  }, [fromQ, toQ, minPrice]);

  return (
    <Container className="py-4">
      <h3 className="section-title mb-3">Vé xe khách</h3>

      <Card className="soft-card p-3 mb-3">
        <Row className="g-2">

          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>
                <FaMapMarkerAlt />
              </InputGroup.Text>
              <Form.Control
                placeholder="Điểm đi"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={1} className="d-flex justify-content-center">
            <div
              onClick={handleSwap}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#ff6b35",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <FaExchangeAlt color="white" />
            </div>
          </Col>

          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>
                <FaRegFlag />
              </InputGroup.Text>
              <Form.Control
                placeholder="Điểm đến"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Col>

          <Col md={2}>
            <button
              className="btn w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleSearch}
              style={{
                backgroundColor: "#ff6b35",
                color: "white",
                borderRadius: "50px",
                padding: "10px 20px",
                border: "none",
                fontWeight: "500"
              }}
            >
              <FaSearch />
              Tìm chuyến
            </button>
          </Col>
        </Row>

      </Card>

      <Row className="g-3">
        {filtered.map((r) => (
          <Col key={r.id} lg={3} md={6}>
            <RouteCard item={r} />
          </Col>
        ))}
        {filtered.length === 0 && (
          <Col>
            <div className="text-muted">Không tìm thấy tuyến phù hợp.</div>
          </Col>
        )}
      </Row>
    </Container>
  );
}
