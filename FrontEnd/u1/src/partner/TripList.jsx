import { useEffect, useState } from "react";
import "./partner.css";

export default function TripList() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const storedTrips = JSON.parse(localStorage.getItem("trips")) || [];
    setTrips(storedTrips);
  }, []);

  return (
    <div className="partner-content">
      <div className="create-trip-header">
        <h1>📋 Danh sách chuyến xe</h1>
        <p>Các chuyến xe bạn đã tạo</p>
      </div>

      <div className="create-trip-form">
        {trips.length === 0 ? (
          <p>Chưa có chuyến xe nào.</p>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="form-card">
              <h3>
                {trip.departure} → {trip.destination}
              </h3>
              <p>📅 {trip.date}</p>
              <p>⏰ {trip.departureTime} - {trip.arrivalTime}</p>
              <p>💰 {trip.price} VND</p>
              <p>🚍 {trip.vehicleType}</p>
              <p>🪑 {trip.seats} ghế</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}