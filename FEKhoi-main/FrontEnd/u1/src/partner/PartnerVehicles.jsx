import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/PartnerVehicles.css";

export default function PartnerVehicles() {

  const { user } = useAuth();
  const partnerId = user?.id;

  const [vehicles, setVehicles] = useState([]);

  const [form, setForm] = useState({
    name: "",
    licensePlate: "",
    type: "",
    numberOfFloors: 1
  });

  const fetchVehicles = async () => {
    try {

      const res = await axios.get(
        `http://localhost:5000/api/partner/vehicles/${partnerId}`
      );

      setVehicles(res.data);

    } catch (err) {
      console.error("Lỗi lấy danh sách xe:", err);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchVehicles();
    }
  }, [partnerId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    try {

      await axios.post("http://localhost:5000/api/partner/vehicles", {
        ...form,
        partnerId
      });

      fetchVehicles();

      setForm({
        name: "",
        licensePlate: "",
        type: "",
        numberOfFloors: 1
      });

    } catch (err) {
      console.error("Lỗi thêm xe:", err);
    }
  };

  return (
    <div className="vehicles-page">
      <h2>🚍 Đội xe của tôi</h2>

      <form onSubmit={handleAddVehicle} className="vehicle-form">

        <input
          name="name"
          placeholder="Tên xe"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="licensePlate"
          placeholder="Biển số"
          value={form.licensePlate}
          onChange={handleChange}
          required
        />

        <input
          name="type"
          placeholder="Loại xe (SLEEPER, VIP...)"
          value={form.type}
          onChange={handleChange}
        />

        <input
          type="number"
          name="numberOfFloors"
          placeholder="Số tầng"
          value={form.numberOfFloors}
          onChange={handleChange}
        />

        <button type="submit">Thêm xe</button>

      </form>

      {vehicles.length === 0 ? (
        <p>Chưa có xe nào.</p>
      ) : (
        vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <h4>🚐 {vehicle.name}</h4>
            <p>Biển số: {vehicle.licensePlate}</p>
            <p>Loại xe: {vehicle.type}</p>
            <p>Số tầng: {vehicle.numberOfFloors}</p>
            <p>
              Trạng thái: {vehicle.isActive ? "Hoạt động" : "Ngưng hoạt động"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}