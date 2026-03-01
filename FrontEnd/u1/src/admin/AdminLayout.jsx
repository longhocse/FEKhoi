import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./admin.css";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // xóa token / user
    navigate("/dang-nhap");  // quay về login
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2 className="logo">🚌 BusGo Admin</h2>

        <NavLink to="/admin" end>
          📊 Dashboard
        </NavLink>

        <NavLink to="/admin/users">
          👤 Người dùng
        </NavLink>

        <NavLink to="/admin/partners">
          🏢 Nhà xe
        </NavLink>

        <NavLink to="/admin/routes">
          🛣 Tuyến xe
        </NavLink>

        <NavLink to="/admin/bookings">
          🎫 Vé xe
        </NavLink>

        <NavLink to="/admin/revenue">
          💰 Doanh thu
        </NavLink>

        <NavLink to="/admin/settings">
          ⚙️ Cài đặt
        </NavLink>

        {/* ===== NÚT ĐĂNG XUẤT ===== */}
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </aside>

      {/* CONTENT */}
      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}