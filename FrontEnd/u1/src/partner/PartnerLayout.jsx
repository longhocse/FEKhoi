import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/partner.css";
import { Button } from "react-bootstrap";

export default function PartnerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/dang-nhap");
  };

  return (
    <div className="partner-layout">

      {/* SIDEBAR */}
      <aside className="partner-sidebar">
        <h2 className="logo">
          <i className="bi bi-bus-front-fill me-2"></i> BusGo Partner
        </h2>

        {/* Trang chủ */}
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="bi bi-house me-2"></i> Trang chủ
        </NavLink>

        {/* Dashboard */}
        <NavLink to="" end className={({ isActive }) => isActive ? "active" : ""}>
          <i className="bi bi-bar-chart me-2"></i> Dashboard
        </NavLink>

        {/* Lịch trình */}
        <NavLink to="trips" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="bi bi-calendar-event me-2"></i> Lịch trình
        </NavLink>

        {/* Đội xe */}
        <NavLink to="vehicles" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="bi bi-bus-front me-2"></i> Quản lý đội xe
        </NavLink>

        {/* Vé được đặt */}
        <NavLink to="tickets" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="bi bi-ticket-perforated me-2"></i> Vé được đặt
        </NavLink>

        {/* Logout */}
        <Button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
        </Button>
      </aside>

      {/* CONTENT */}
      <main className="partner-content">
        <Outlet />
      </main>
    </div>
  );
}