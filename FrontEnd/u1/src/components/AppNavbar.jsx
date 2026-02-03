import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

export default function AppNavbar() {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="bg-secondary-custom" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fw-bold">
          <i className="bi bi-bus-front me-2" />
          BUGO
        </Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="mx-auto gap-2">
            <Nav.Link as={NavLink} to="/" end>Trang chủ</Nav.Link>
            <Nav.Link as={NavLink} to="/tuyen-xe">Vé xe khách</Nav.Link>
            <Nav.Link as={NavLink} to="/doi-tac">Dành cho nhà xe</Nav.Link>
          </Nav>

          <div className="d-flex gap-2">
            <Button variant="outline-light" onClick={() => navigate("/dang-nhap")}>
              Đăng nhập
            </Button>
            <Button variant="primary" onClick={() => navigate("/dang-ky")} className="pill px-3">
              Đăng ký
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
