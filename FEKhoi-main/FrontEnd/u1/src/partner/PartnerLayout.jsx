import { Link, Outlet, useLocation } from "react-router-dom";
import "./partner.css";

export default function PartnerLayout() {
  const location = useLocation();

  const menu = [
    { name: "Trang tổng hợp dữ liệu", path: "/doi-tac", icon: "📊" },
    { name: "Tạo chuyến xe", path: "/doi-tac/tao-chuyen-xe", icon: "➕" },
    { name: "Lịch trình", path: "/doi-tac/lich-trinh", icon: "🗓" },
    { name: "Quản lý đội xe", path: "/doi-tac/doi-xe", icon: "🚌" },
    { name: "Tuyến đường", path: "/doi-tac/tuyen-duong", icon: "🛣" },
    { name: "Quản lý vé", path: "/doi-tac/ve", icon: "🎫" },
    { name: "Khách hàng", path: "/doi-tac/khach-hang", icon: "👤" },
    { name: "Tài xế", path: "/doi-tac/tai-xe", icon: "👨‍✈️" },
    { name: "Doanh thu", path: "/doi-tac/doanh-thu", icon: "💰" },
    { name: "Thông báo", path: "/doi-tac/thong-bao", icon: "🔔" },
    { name: "Cài đặt", path: "/doi-tac/cai-dat", icon: "⚙️" }
  ];

  return (
    <div className="partner-layout">

      <div className="partner-sidebar">

        <h2 className="logo">🚌 BusGo</h2>

        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`menu-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="icon">{item.icon}</span>
            {item.name}
          </Link>
        ))}

      </div>

      <div className="partner-content">
        <Outlet />
      </div>

    </div>
  );
}