import { Container, Card, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card className="soft-card p-4">
        <h3 className="section-title mb-3">Đăng nhập</h3>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="email@..." />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control type="password" placeholder="••••••••" />
          </Form.Group>

          <Button variant="primary" className="w-100 pill">Đăng nhập</Button>

          <div className="text-center mt-3 small">
            Chưa có tài khoản? <Link to="/dang-ky" className="text-primary-custom fw-semibold">Đăng ký</Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
