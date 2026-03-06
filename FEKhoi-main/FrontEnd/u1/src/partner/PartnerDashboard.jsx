// src/partner/PartnerDashboard.jsx

import { useNavigate } from "react-router-dom";
import "./partner.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PartnerDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTrips: 0,
    revenue: 0,
    totalPassengers: 0,
    totalBuses: 0
  });

  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/partner/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    const fetchTrips = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/partner/trips");
        setTrips(res.data);
      } catch (err) {
        console.error("Error fetching trips:", err);
      }
    };

    fetchStats();
    fetchTrips();
  }, []);

  return (
    <div className="partner-page">

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
          <p>{stats.revenue} VND</p>
          <span>View Wallet →</span>
        </div>

        <div className="stat-card purple">
          <h4>Báo cáo & Phân tích</h4>
          <p>Doanh số & thống kê</p>
          <span>Xem dữ liệu →</span>
        </div>

      </div>


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
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.bus_code}</td>
                <td>{trip.route}</td>
                <td>{trip.time}</td>
                <td>
                  <span className="badge info">{trip.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}