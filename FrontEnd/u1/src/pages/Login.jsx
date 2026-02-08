// src/pages/Login.jsx
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/"); // khách hàng về trang chủ
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card className="soft-card p-4">
        <h3 className="section-title mb-3">Đăng nhập</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="email@..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {/* NÚT ĐĂNG NHẬP KHÁCH */}
          <Button
            variant="primary"
            className="w-100 pill mb-3"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          {/* NÚT ĐĂNG NHẬP NHÀ XE */}
          <Button
            variant="outline-dark"
            className="w-100 pill mb-3"
            type="button"
            onClick={() => navigate("/dang-nhap-nha-xe")}
          >
            Đăng nhập với tư cách nhà xe
          </Button>

          <div className="text-center small">
            Chưa có tài khoản?{" "}
            <Link to="/dang-ky" className="text-primary-custom fw-semibold">
              Đăng ký
            </Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
