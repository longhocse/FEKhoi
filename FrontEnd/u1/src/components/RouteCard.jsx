import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function RouteCard({ item }) {
  const navigate = useNavigate();

  return (
    <Card className="soft-card h-100 overflow-hidden">
      {/* Ảnh demo */}
      <div style={{ height: 120 }} className="hero" />

      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {/* FROM → TO */}
            <div className="fw-bold">
              {item.fromStation} → {item.toStation}
            </div>

            {/* START TIME */}
            <div className="text-muted small">
              Khởi hành:{" "}
              {new Date(item.startTime).toLocaleString("vi-VN")}
            </div>
          </div>

          <Badge bg="light" text="dark" className="border">
            Phổ biến
          </Badge>
        </div>

        <div className="mt-3 d-flex align-items-center justify-content-between">
          {/* PRICE */}
          <div className="fw-bold text-primary-custom">
            {Number(item.price).toLocaleString("vi-VN")}đ
          </div>

          <Button
            variant="outline-primary"
            size="sm"
            className="pill px-3"
            onClick={() => navigate(`/tuyen-xe/${item.id}`)}
          >
            Chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}