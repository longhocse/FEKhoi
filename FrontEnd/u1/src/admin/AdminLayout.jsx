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

  // Log để kiểm tra
  console.log("AdminLayout rendered");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="logo">🚌 BusGo Admin</h2>

        <div className="menu">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? "active" : ""}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => isActive ? "active" : ""}>
            👤 Người dùng
          </NavLink>

          <NavLink to="/admin/nha-xe" className={({ isActive }) => isActive ? "active" : ""}>
            🏢 Nhà xe
          </NavLink>

          <NavLink to="/admin/quan-ly-ve" className={({ isActive }) => isActive ? "active" : ""}>
            🎫 Quản lý vé
          </NavLink>

          {/* THÊM MENU REFUND - KIỂM TRA ĐƯỜNG DẪN */}
          <NavLink to="/admin/refunds" className={({ isActive }) => isActive ? "active" : ""}>
            💰 Hoàn tiền
          </NavLink>

          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "active" : ""}>
            ⚙️ Cài đặt
          </NavLink>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}