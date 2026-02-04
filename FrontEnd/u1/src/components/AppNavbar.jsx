// src/components/AppNavbar.jsx
import { Container, Nav, Navbar, Button, Dropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="bg-secondary-custom" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fw-bold">
          <i className="bi bi-bus-front me-2" />
          BUSGO
        </Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="mx-auto gap-2">
            <Nav.Link as={NavLink} to="/" end>Trang chủ</Nav.Link>
            <Nav.Link as={NavLink} to="/tuyen-xe">Vé xe khách</Nav.Link>
            <Nav.Link as={NavLink} to="/doi-tac">Dành cho nhà xe</Nav.Link>
          </Nav>

          <div className="d-flex gap-2">
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="pill">
                  <i className="bi bi-person-circle me-2"></i>
                  {user?.name || 'Tài khoản'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={NavLink} to="/thong-tin-ca-nhan">
                    <i className="bi bi-person me-2"></i>
                    Thông tin cá nhân
                  </Dropdown.Item>
                  <Dropdown.Item as={NavLink} to="/chon-ghe">
                    <i className="bi bi-ticket-perforated me-2"></i>
                    Vé của tôi
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Button variant="outline-light" onClick={() => navigate("/dang-nhap")}>
                  Đăng nhập
                </Button>
                <Button variant="primary" onClick={() => navigate("/dang-ky")} className="pill px-3">
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}