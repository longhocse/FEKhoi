// src/partner/PartnerSidebar.jsx

import { NavLink } from "react-router-dom";
import "./partner.css";

export default function PartnerSidebar() {
  return (
    <div className="partner-sidebar">

      <h2 className="logo">🚌 BusGo</h2>

      <NavLink to="/doi-tac" end>
        📊 Trang tổng hợp dữ liệu
      </NavLink>

      <NavLink to="/doi-tac/tao-chuyen-xe">
        ➕ Tạo chuyến xe
      </NavLink>

      <NavLink to="/doi-tac/lich-trinh">
        🗓 Lịch trình
      </NavLink>

      <NavLink to="/doi-tac/doi-xe">
        🚌 Quản lý đội xe
      </NavLink>

      <NavLink to="/doi-tac/tuyen-duong">
        🛣 Tuyến đường
      </NavLink>

      <NavLink to="/doi-tac/ve">
        🎫 Quản lý vé
      </NavLink>

      <NavLink to="/doi-tac/khach-hang">
        👤 Khách hàng
      </NavLink>

      <NavLink to="/doi-tac/tai-xe">
        👨‍✈️ Tài xế
      </NavLink>

      <NavLink to="/doi-tac/doanh-thu">
        💰 Doanh thu
      </NavLink>

      <NavLink to="/doi-tac/thong-bao">
        🔔 Thông báo
      </NavLink>

      <NavLink to="/doi-tac/cai-dat">
        ⚙️ Cài đặt
      </NavLink>

    </div>
  );
}