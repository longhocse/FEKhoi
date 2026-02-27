import { Container, Row, Col, Form, Card } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import RouteCard from "../components/RouteCard";
import { useEffect } from "react";
import { useTrip } from "../context/TripContext";

export default function RoutesPage() {
  const [params] = useSearchParams();
  const { trips, loading, filters, setFilters } = useTrip();

  const fromQ = params.get("from") || "";
  const toQ = params.get("to") || "";

  // Khi thay đổi from/to trên URL
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      from: fromQ,
      to: toQ,
      page: 1,
    }));
  }, [fromQ, toQ]);

  return (
    <Container className="py-4">
      <h3 className="section-title mb-3">Vé xe khách</h3>

      <Card className="soft-card p-3 mb-3">
        <Row className="g-2">
          <Col md={4}>
            <Form.Control value={fromQ} disabled />
          </Col>
          <Col md={4}>
            <Form.Control value={toQ} disabled />
          </Col>
          <Col md={4}>
            <Form.Control
              placeholder="Giá tối thiểu (vd: 150000)"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: e.target.value,
                  page: 1,
                }))
              }
            />
          </Col>
        </Row>
      </Card>

      {loading && <div>Đang tải...</div>}

      <Row className="g-3">
        {trips.length === 0 && !loading && (
          <Col>
            <div className="text-muted">
              Không tìm thấy tuyến phù hợp.
            </div>
          </Col>
        )}

        {trips.map((r) => (
          <Col key={r.id} lg={3} md={6}>
            <RouteCard item={r} />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline-primary me-2"
          disabled={filters.page === 1}
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              page: prev.page - 1,
            }))
          }
        >
          Trang trước
        </button>

        <span className="mx-3 align-self-center">
          Trang {filters.page}
        </span>

        <button
          className="btn btn-outline-primary"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              page: prev.page + 1,
            }))
          }
        >
          Trang sau
        </button>
      </div>
    </Container>
  );
}