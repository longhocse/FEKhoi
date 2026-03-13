import { useEffect, useState } from "react";
import axios from "axios";

export default function PartnerVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    licensePlate: "",
    type: "",
    numberOfFloors: 1
  });

  const partnerId = 2; // partner trong DB của bạn là id = 2

  useEffect(() => {
    fetchVehicles();
  }, []);

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
    <div style={{ padding: "20px" }}>
      <h2>🚍 Đội xe của tôi</h2>

      {/* FORM */}
      <form onSubmit={handleAddVehicle} style={{ marginBottom: 30 }}>
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

      {/* DANH SÁCH XE */}
      {vehicles.length === 0 ? (
        <p>Chưa có xe nào.</p>
      ) : (
        vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginBottom: 15,
              borderRadius: 8,
            }}
          >
            <h4>🚐 {vehicle.name}</h4>
            <p>Biển số: {vehicle.licensePlate}</p>
            <p>Loại xe: {vehicle.type}</p>
            <p>Số tầng: {vehicle.numberOfFloors}</p>
            <p>
              Trạng thái:{" "}
              {vehicle.isActive ? "Hoạt động" : "Ngưng hoạt động"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}