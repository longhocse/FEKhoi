// src/pages/Register.jsx
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      // Loại bỏ confirmPassword trước khi gửi
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate("/");
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card className="soft-card p-4">
        <h3 className="section-title mb-3">Đăng ký</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Họ tên</Form.Label>
            <Form.Control 
              name="name"
              placeholder="Nguyễn Văn A" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              name="email"
              type="email" 
              placeholder="email@..." 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control 
              name="phone"
              type="tel" 
              placeholder="0987 654 321" 
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control 
              name="password"
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Xác nhận mật khẩu</Form.Label>
            <Form.Control 
              name="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button 
            variant="primary" 
            className="w-100 pill"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
          </Button>

          <div className="text-center mt-3 small">
            Đã có tài khoản? <Link to="/dang-nhap" className="text-primary-custom fw-semibold">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
}