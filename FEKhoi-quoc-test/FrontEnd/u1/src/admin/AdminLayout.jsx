import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./admin.css";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/dang-nhap");
  };

  return (
    <div className="admin-layout">

      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
  <h2 className="logo">🚌 BusGo Admin</h2>

  <div className="menu">
    <NavLink to="/admin" end>
      📊 Dashboard
    </NavLink>

    <NavLink to="/admin/users">
      👤 Người dùng
    </NavLink>

    <NavLink to="/admin/nha-xe">
      🏢 Nhà xe
    </NavLink>

    <NavLink to="/admin/quan-ly-ve">
      🎫 Quản lý vé
    </NavLink>

    <NavLink to="/admin/settings">
      ⚙️ Cài đặt
    </NavLink>
  </div>

  <button className="logout-btn" onClick={handleLogout}>
    🚪 Đăng xuất
  </button>
</aside>

      {/* ===== CONTENT ===== */}
      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}