// src/components/AppNavbar.jsx
import { Container, Nav, Navbar, Button, Dropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletProvider"; // Import từ WalletProvider
import { useEffect } from "react";

export default function AppNavbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  // Sử dụng useWallet với kiểm tra an toàn
  let walletData = { balance: 0, loading: false, refreshWallet: () => { } };
  try {
    walletData = useWallet();
  } catch (error) {
    console.log("Wallet not available yet");
  }

  const { balance, loading, refreshWallet } = walletData;

  useEffect(() => {
    if (isAuthenticated && refreshWallet) {
      refreshWallet();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/dang-nhap");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
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
              Trang chủ
            </Nav.Link>

            <Nav.Link as={NavLink} to="/tuyen-xe">
              Vé xe khách
            </Nav.Link>

            <Nav.Link as={NavLink} to="/doi-tac">
              Dành cho nhà xe
            </Nav.Link>
          </Nav>

          {/* ===== KHU VỰC TÀI KHOẢN ===== */}
          <div className="d-flex gap-2 align-items-center">
            {isAuthenticated ? (
              <>
                {/* Hiển thị số dư ví */}
                {!loading && (
                  <Button
                    variant="outline-light"
                    className="d-flex align-items-center gap-2"
                    onClick={() => navigate("/vi")}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }}
                  >
                    <i className="bi bi-wallet2"></i>
                    <span className="fw-bold">{formatCurrency(balance || 0)}</span>
                  </Button>
                )}

                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    className="pill d-flex align-items-center"
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.name || "Tài khoản"}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={NavLink} to="/thong-tin-ca-nhan">
                      <i className="bi bi-person me-2"></i>
                      Thông tin cá nhân
                    </Dropdown.Item>

                    <Dropdown.Item as={NavLink} to="/ve-cua-toi">
                      <i className="bi bi-ticket-perforated me-2"></i>
                      Vé của tôi
                    </Dropdown.Item>

                    <Dropdown.Item as={NavLink} to="/vi">
                      <i className="bi bi-wallet2 me-2"></i>
                      Ví điện tử
                      <span className="ms-2 text-success fw-bold">
                        {formatCurrency(balance || 0)}
                      </span>
                    </Dropdown.Item>

                    <Dropdown.Item as={NavLink} to="/vi/nap-tien">
                      <i className="bi bi-currency-dollar me-2"></i>
                      Nạp tiền
                    </Dropdown.Item>

                    {isAdmin && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={NavLink} to="/admin">
                          <i className="bi bi-shield-lock me-2"></i>
                          Quản lý hệ thống
                        </Dropdown.Item>
                      </>
                    )}

                    <Dropdown.Divider />

                    <Dropdown.Item onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Button
                  variant="outline-light"
                  onClick={() => navigate("/dang-nhap")}
                >
                  Đăng nhập
                </Button>

                <Button
                  variant="primary"
                  className="pill px-3"
                  onClick={() => navigate("/dang-ky")}
                >
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
