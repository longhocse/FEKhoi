import { useEffect, useState } from "react";

export default function AdminRoutes() {

  const [trips, setTrips] = useState([]);

  const fetchTrips = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/trips");
      const data = await res.json();
      setTrips(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const toggleStatus = async (id) => {
    await fetch(`http://localhost:5000/api/admin/trips/${id}/toggle`, {
      method: "PUT"
    });

    fetchTrips(); // reload lại
  };

  return (
    <div>
      <h2>🛣 Quản lý Tuyến xe</h2>

      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Điểm đi</th>
            <th>Điểm đến</th>
            <th>Nhà xe</th>
            <th>Giờ chạy</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {trips.map(trip => (
            <tr key={trip.id}>
              <td>{trip.id}</td>
              <td>{trip.fromStation}</td>
              <td>{trip.toStation}</td>
              <td>{trip.partnerName}</td>
              <td>{new Date(trip.startTime).toLocaleString()}</td>
              <td>{trip.price.toLocaleString()} ₫</td>
              <td>
                {trip.isActive ? "🟢 Hoạt động" : "🔴 Đã khóa"}
              </td>
              <td>
                <button onClick={() => toggleStatus(trip.id)}>
                  {trip.isActive ? "Khóa" : "Mở"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}