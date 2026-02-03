import { Container, Card, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card className="soft-card p-4">
        <h3 className="section-title mb-3">Đăng ký</h3>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Họ tên</Form.Label>
            <Form.Control placeholder="Nguyễn Văn A" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="email@..." />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control type="password" placeholder="••••••••" />
          </Form.Group>

          <Button variant="primary" className="w-100 pill">Tạo tài khoản</Button>

          <div className="text-center mt-3 small">
            Đã có tài khoản? <Link to="/dang-nhap" className="text-primary-custom fw-semibold">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
