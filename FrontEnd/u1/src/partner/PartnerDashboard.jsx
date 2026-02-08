// src/partner/PartnerDashboard.jsx
import { useNavigate } from "react-router-dom";
import "./partner.css";

export default function PartnerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="partner-page">
      {/* ===== STAT CARDS ===== */}
      <div className="stat-grid">
        <div
          className="stat-card orange"
          onClick={() => navigate("/doi-tac/tao-chuyen-xe")}
        >
          <h4>Tạo chuyến xe</h4>
          <p>Lên lịch chuyến mới</p>
          <span>Bắt đầu ngay →</span>
        </div>

        <div className="stat-card blue">
          <h4>Thông tin doanh nghiệp</h4>
          <p>Cập nhật thông tin nhà xe</p>
          <span>Chỉnh sửa →</span>
        </div>

        <div className="stat-card green">
          <h4>Rút tiền</h4>
          <p>Quản lý doanh thu</p>
          <span>View Wallet →</span>
        </div>

        <div className="stat-card purple">
          <h4>Báo cáo & Phân tích</h4>
          <p>Doanh số & thống kê</p>
          <span>Xem dữ liệu →</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="table-card">
        <div className="table-header">
          <h3>Chuyến khởi hành gần đây</h3>
          <span className="view-all">Xem tất cả</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Mã xe</th>
              <th>Tuyến đường</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>B-1024</td>
              <td>Đà Nẵng → Hồ Chí Minh</td>
              <td>08:00</td>
              <td>
                <span className="badge success">Departed</span>
              </td>
            </tr>
            <tr>
              <td>B-2055</td>
              <td>Hà Nội → Hồ Chí Minh</td>
              <td>09:30</td>
              <td>
                <span className="badge warning">Boarding</span>
              </td>
            </tr>
            <tr>
              <td>B-1088</td>
              <td>Hồ Chí Minh → Huế</td>
              <td>11:00</td>
              <td>
                <span className="badge info">Scheduled</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
