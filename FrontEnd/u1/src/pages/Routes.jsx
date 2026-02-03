import { Container, Row, Col, Form, Card } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { popularRoutes } from "../data/mockRoutes";
import RouteCard from "../components/RouteCard";
import { useMemo, useState } from "react";

export default function RoutesPage() {
  const [params] = useSearchParams();
  const [minPrice, setMinPrice] = useState("");

  const fromQ = (params.get("from") || "").toLowerCase();
  const toQ = (params.get("to") || "").toLowerCase();

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
          <Col md={4}>
            <Form.Control value={params.get("from") || ""} disabled />
          </Col>
          <Col md={4}>
            <Form.Control value={params.get("to") || ""} disabled />
          </Col>
          <Col md={4}>
            <Form.Control
              placeholder="Giá tối thiểu (vd: 150000)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
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
