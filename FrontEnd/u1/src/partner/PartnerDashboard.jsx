// src/partner/PartnerDashboard.jsx
import { useNavigate } from "react-router-dom";
import "../styles/PartnerDashboard.css";
import { useEffect, useState } from "react";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


export default function PartnerDashboard() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const partnerId = user?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 4;
  const totalPages = Math.ceil(trips.length / tripsPerPage);


  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip);


  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/partner/trips/${partnerId}`
      );
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="partner-page">
      {/* ===== STAT CARDS ===== */}
      <div className="stat-grid">
        <div
          className="stat-card orange"
          onClick={() => navigate("/doi-tac/create-trip")}
        >
          <h4>Tạo chuyến xe</h4>
          <p>Lên lịch chuyến mới</p>
          <span>Bắt đầu ngay →</span>
        </div>

        <div
          className="stat-card blue"
          onClick={() => navigate("/thong-tin-ca-nhan")}
        >
          <h4>Thông tin doanh nghiệp</h4>
          <p>Cập nhật thông tin nhà xe</p>
          <span>Chỉnh sửa →</span>
        </div>

        <div className="stat-card green">
          <h4>Rút tiền</h4>
          <p>Quản lý doanh thu</p>
          <span>View Wallet →</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="table-card">
        <div className="table-header">
          <h3>Chuyến khởi hành gần đây</h3>
        </div>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Mã xe</th>
              <th>Tuyến đường</th>
              <th>Thời gian xuất phát</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentTrips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.routeName}</td>

                <td>{trip.vehicleName}</td>

                <td>
                  {trip.startTime
                    ? new Date(trip.startTime).toLocaleString()
                    : "N/A"}
                </td>

                <td>
                  {trip.price
                    ? trip.price.toLocaleString() + " đ"
                    : "0 đ"}
                </td>

                <td>
                  <Badge className="status-badge">
                    {trip.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
