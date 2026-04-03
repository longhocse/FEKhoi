// src/pages/Login.jsx
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [errors, setErrors] = useState({}); // ✅ validation errors

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ===== VALIDATE =====
  const validate = () => {
    const newErrors = {};

    // Email
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password
    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return; // ❌ stop nếu invalid

    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "partner") {
        navigate("/doi-tac");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card className="soft-card p-4">
        <h3 className="section-title mb-3">Đăng nhập</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
          {/* EMAIL */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="email@..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" })); // clear lỗi
              }}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          {/* PASSWORD */}
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          {/* LOGIN BUTTON */}
          <Button
            variant="primary"
            className="w-100 pill mb-3"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          {/* PARTNER LOGIN */}
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