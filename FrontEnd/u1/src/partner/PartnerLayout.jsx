// src/partner/PartnerLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import "./partner.css";

export default function PartnerLayout() {
  return (
    <div className="partner-wrapper">
      {/* ===== SIDEBAR ===== */}
      <aside className="partner-sidebar">
        <div className="sidebar-logo">
          🚌 <span>BusGo</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink end to="/doi-tac" className="menu-item">
            📊 Trang tổng hợp dữ liệu
          </NavLink>

          <NavLink to="/doi-tac/tao-chuyen-xe" className="menu-item">
            ➕ Tạo chuyến xe
          </NavLink>

          <NavLink to="/doi-tac/lich-trinh" className="menu-item">
            🗓️ Lịch trình
          </NavLink>

          <NavLink to="/doi-tac/quan-ly-xe" className="menu-item">
            🚌 Quản lý đội xe
          </NavLink>

          <NavLink to="/doi-tac/cai-dat" className="menu-item">
            ⚙️ Cài đặt
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          ⏻ Đăng xuất
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="partner-content">
        <Outlet />
      </main>
    </div>
  );
}
