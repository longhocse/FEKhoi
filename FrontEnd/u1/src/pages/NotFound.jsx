import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Container className="py-5 text-center">
      <h2 className="section-title">404 - Không tìm thấy trang</h2>
      <p className="text-muted">Bạn có thể quay lại trang chủ.</p>
      <Button variant="primary" className="pill px-4" onClick={() => navigate("/")}>
        Về trang chủ
      </Button>
    </Container>
  );
}
