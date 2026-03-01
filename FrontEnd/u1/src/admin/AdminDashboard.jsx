import { useEffect, useState } from "react";
import "./admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/dashboard")
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(err => {
        console.error("Lỗi lấy dashboard:", err);
      });
  }, []);

  return (
    <>
      {/* CARDS */}
      <div className="admin-stats">
        <div className="card blue">
          <h3>{stats.totalUsers}</h3>
          <p>Người dùng</p>
        </div>

        <div className="card green">
          <h3>{stats.totalPartners}</h3>
          <p>Nhà xe</p>
        </div>

        <div className="card orange">
          <h3>--</h3>
          <p>Chuyến xe</p>
        </div>

        <div className="card red">
          <h3>--</h3>
          <p>Doanh thu</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-table">
        <h3>Vé đặt gần đây</h3>

        <table>
          <thead>
            <tr>
              <th>Mã vé</th>
              <th>Khách</th>
              <th>Tuyến</th>
              <th>Giá</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Chưa có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}