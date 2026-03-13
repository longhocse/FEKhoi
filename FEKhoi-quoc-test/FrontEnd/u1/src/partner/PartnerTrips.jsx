import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PartnerTrips() {
  const [trips, setTrips] = useState([]);
  const partnerId = 2; // test

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
    <div style={{ padding: 30 }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2>🚌 Danh sách chuyến xe</h2>
          <button style={buttonStyle}>+ Thêm chuyến</button>
        </div>

        {trips.length === 0 ? (
          <div style={emptyStyle}>
            🚫 Chưa có chuyến nào
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Tuyến</th>
                <th>Xe</th>
                <th>Khởi hành</th>
                <th>Giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.routeName}</td>
                  <td>{trip.vehicleName}</td>
                  <td>
                    {new Date(trip.departureTime).toLocaleString()}
                  </td>
                  <td>
                    {trip.price.toLocaleString()} đ
                  </td>
                  <td>
                    <span style={badgeStyle}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const badgeStyle = {
  background: "#16a34a",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
};

const emptyStyle = {
  padding: 30,
  textAlign: "center",
  color: "#888",
};