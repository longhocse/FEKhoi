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

          <NavLink to="/admin/refunds" className={({ isActive }) => isActive ? "active" : ""}>
            💰 Hoàn tiền
          </NavLink>

          {/* SỬA LẠI DÒNG NÀY */}
          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="bi bi-flag me-2"></i>
             Báo cáo
          </NavLink>
          <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="bi bi-star me-2"></i>
            Đánh giá
          </NavLink>

          <NavLink to="/admin/routes" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="bi bi-geo-alt me-2"></i>
            Tuyến đường
          </NavLink>

          <NavLink to="/admin/admin-trips" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="bi bi-bus-front me-2"></i>
            Chuyến xe
          </NavLink>

          <NavLink to="/admin/seats" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="bi bi-grid-3x3-gap-fill me-2"></i>
            Quản lý ghế
          </NavLink>

          <NavLink to="/admin/promotions" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="bi bi-tag-fill me-2"></i>
            Khuyến mãi
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