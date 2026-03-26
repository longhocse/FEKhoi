import { Container, Card, Form, Button, Alert, Navbar, Nav } from "react-bootstrap";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PartnerLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password, "partner");

      // 🚨 Kiểm tra role
      if (user.role !== "partner") {
        setError("Tài khoản này không phải nhà xe!");
        return;
      }

      // ✅ Nếu đúng partner
      navigate("/nha-xe");

    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <>
      {/* Navbar giống như AppNavbar */}
      <Navbar
        expand="lg"
        variant="dark"
        sticky="top"
        className="bg-secondary-custom"
      >
        <Container>
          {/* ===== LOGO ===== */}
          <Navbar.Brand as={NavLink} to="/" className="fw-bold">
            <i className="bi bi-bus-front me-2" />
            BUSGO
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            {/* ===== MENU CHÍNH ===== */}
            <Nav className="mx-auto gap-3">
              <Nav.Link as={NavLink} to="/" end>
                <i className="bi bi-house-door me-1"></i>
                Trang chủ
              </Nav.Link>

              <Nav.Link as={NavLink} to="/tuyen-xe">
                <i className="bi bi-bus-front me-1"></i>
                Vé xe khách
              </Nav.Link>

              <Nav.Link as={NavLink} to="/tin-tuc">
                <i className="bi bi-newspaper me-1"></i>
                Tin tức
              </Nav.Link>

              <Nav.Link as={NavLink} to="/doi-tac">
                <i className="bi bi-building me-1"></i>
                Dành cho nhà xe
              </Nav.Link>
            </Nav>

            {/* ===== KHU VỰC TÀI KHOẢN ===== */}
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="outline-light"
                className="d-flex align-items-center gap-2"
                onClick={() => navigate("/dang-nhap")}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Đăng nhập
              </Button>

              <Button
                variant="primary"
                className="pill px-3"
                onClick={() => navigate("/dang-ky")}
              >
                <i className="bi bi-person-plus me-2"></i>
                Đăng ký
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Form đăng nhập nhà xe */}
      <Container className="py-5" style={{ maxWidth: 520 }}>
        <Card className="p-4 shadow-sm border-0">
          <div className="text-center mb-3">
            <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-2">
              <i className="bi bi-building fs-1 text-primary"></i>
            </div>
          </div>
          <h3 className="mb-2 text-center" style={{ color: '#0066b3' }}>
            Đăng nhập nhà xe
          </h3>
          <p className="text-muted text-center mb-4">
            Đăng nhập để quản lý tuyến xe, chuyến đi và đặt vé
          </p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500' }}>
                <i className="bi bi-envelope me-1"></i>
                Email nhà xe
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="nhaxe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  borderColor: '#dee2e6',
                  borderRadius: '10px',
                  padding: '12px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500' }}>
                <i className="bi bi-lock me-1"></i>
                Mật khẩu
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderColor: '#dee2e6',
                  borderRadius: '10px',
                  padding: '12px'
                }}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mb-3">
              <NavLink to="/quen-mat-khau" className="text-decoration-none" style={{ color: '#ff6600' }}>
                Quên mật khẩu?
              </NavLink>
            </div>

            <Button
              type="submit"
              className="w-100 mb-3 border-0"
              style={{
                backgroundColor: '#ff6600',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: '600'
              }}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Đăng nhập nhà xe
            </Button>

            <div className="text-center text-muted">
              Chưa có tài khoản nhà xe?{" "}
              <NavLink to="/nha-xe/dang-ky" className="text-decoration-none" style={{ color: '#ff6600' }}>
                Đăng ký ngay
              </NavLink>
            </div>
          </Form>

          <hr className="my-4" />

          <div className="text-center">
            <NavLink to="/dang-nhap" className="text-decoration-none" style={{ color: '#0066b3' }}>
              <i className="bi bi-arrow-left me-1"></i>
              Đăng nhập tài khoản khách hàng
            </NavLink>
          </div>
        </Card>
      </Container>

      {/* Footer */}
      <footer className="py-4 mt-5" style={{ backgroundColor: '#f8f9fa' }}>
        <Container className="text-center text-muted">
          <small>© 2024 BUSGO. Tất cả các quyền được bảo lưu.</small>
        </Container>
      </footer>
    </>
  );
}
