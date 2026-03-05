import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./partner.css";

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
        <h2 className="logo">🚌 BusGo Partner</h2>

        {/* Trang chính */}
        <NavLink to="/">
          🏠 Trang chính
        </NavLink>

        {/* Dashboard */}
        <NavLink to="" end >
          📊 Dashboard
        </NavLink>

        {/* Lịch trình */}
        <NavLink to="trips">
          📅 Lịch trình
        </NavLink>

        {/* Đội xe */}
        <NavLink to="vehicles">
          🚌 Quản lý đội xe
        </NavLink>

        {/* Cài đặt */}
        <NavLink to="settings">
          ⚙️ Cài đặt
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </aside>

      {/* CONTENT */}
      <main className="partner-content">
        <Outlet />
      </main>
    </div>
  );
}