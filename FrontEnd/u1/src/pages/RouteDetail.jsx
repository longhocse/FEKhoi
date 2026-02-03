import { Container, Card, Button, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { popularRoutes } from "../data/mockRoutes";

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const route = popularRoutes.find((r) => String(r.id) === String(id));

  if (!route) return <Container className="py-4">Không tìm thấy tuyến.</Container>;

  return (
    <Container className="py-4">
      <Button variant="link" className="text-primary-custom px-0" onClick={() => navigate(-1)}>
        ← Quay lại
      </Button>

      <Card className="soft-card p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h3 className="section-title mb-1">{route.from} → {route.to}</h3>
            <div className="text-muted">{route.company} • {route.duration}</div>
          </div>
          <Badge bg="light" text="dark" className="border">E-ticket</Badge>
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center">
          <div className="fs-3 fw-bold text-primary-custom">
            {route.price.toLocaleString("vi-VN")}đ
          </div>
          <Button className="pill px-4" variant="primary">
            Đặt vé ngay
          </Button>
        </div>
      </Card>
    </Container>
  );
}
