import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./partner.css";

export default function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departure: "",
    destination: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    vehicleType: "",
    vehicleStatus: "",
    licensePlate: "",
    seats: "",
    description: "",
    services: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  const handleSubmit = () => {
    if (
      !formData.departure ||
      !formData.destination ||
      !formData.date ||
      !formData.departureTime ||
      !formData.price
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const trips = JSON.parse(localStorage.getItem("trips")) || [];
    trips.push({ ...formData, id: Date.now() });
    localStorage.setItem("trips", JSON.stringify(trips));

    alert("Tạo chuyến xe thành công!");
    navigate("/doi-tac/danh-sach-chuyen");
  };

  return (
    <div className="partner-content">
      {/* ===== HEADER ===== */}
      <div className="create-trip-header">
        <h1>🚌 Tạo chuyến xe mới</h1>
        <p>Điền thông tin chi tiết để tạo một chuyến xe khách liên tỉnh</p>
      </div>

      {/* ===== FORM ===== */}
      <div className="create-trip-form">
        {/* ===== ROUTE INFO ===== */}
        <div className="form-card">
          <h3>📍 Thông tin tuyến đường</h3>
          <div className="form-grid">
            <div>
              <label>Điểm xuất phát *</label>
              <input
                name="departure"
                value={formData.departure}
                onChange={handleChange}
                placeholder="Ví dụ: Hà Nội"
              />
            </div>
            <div>
              <label>Điểm đến *</label>
              <input
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Ví dụ: Hải Phòng"
              />
            </div>
          </div>
        </div>

        {/* ===== TIME INFO ===== */}
        <div className="form-card">
          <h3>⏰ Thông tin thời gian</h3>
          <div className="form-grid">
            <div>
              <label>Ngày khởi hành *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Giờ khởi hành *</label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Thời gian đến dự kiến *</label>
              <input
                type="time"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ===== SERVICES ===== */}
        <div className="form-card">
          <h3>🍹 Dịch vụ trên xe</h3>
          <div className="service-grid">
            {[
              "📶 WiFi miễn phí",
              "❄️ Điều hòa",
              "🔌 Sạc điện thoại",
              "🛏️ Chăn gối",
              "💧 Nước uống",
              "🍪 Đồ ăn nhẹ",
              "🚻 Nhà vệ sinh",
              "📺 TV / Giải trí",
            ].map((s) => (
              <label key={s} className="service-item">
                <input
                  type="checkbox"
                  checked={formData.services.includes(s)}
                  onChange={() => handleServiceChange(s)}
                /> {s}
              </label>
            ))}
          </div>
        </div>

        {/* ===== PRICE ===== */}
        <div className="form-card">
          <h3>💰 Giá vé</h3>
          <div className="form-grid">
            <div>
              <label>Giá vé mỗi hành khách (VND) *</label>
              <input
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ví dụ: 250000"
              />
            </div>
          </div>
        </div>

        {/* ===== BUS INFO ===== */}
        <div className="form-card">
          <h3>🚍 Thông tin xe</h3>
          <div className="form-grid">
            <div>
              <label>Loại xe *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
              >
                <option>Chọn loại xe</option>
                <option>Giường nằm</option>
                <option>Limousine</option>
                <option>Ghế ngồi</option>
              </select>
            </div>
            <div>
              <label>Tình trạng xe *</label>
              <select
                name="vehicleStatus"
                value={formData.vehicleStatus}
                onChange={handleChange}
              >
                <option>Chọn tình trạng</option>
                <option>Mới</option>
                <option>Đang hoạt động</option>
              </select>
            </div>
            <div>
              <label>Biển số xe *</label>
              <input
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="Ví dụ: 29A-12345"
              />
            </div>
            <div>
              <label>Số ghế *</label>
              <input
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                placeholder="Ví dụ: 40"
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Mô tả thêm (tuỳ chọn)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Thông tin bổ sung về xe, tài xế, chính sách..."
            />
          </div>
        </div>

        {/* ===== ACTION ===== */}
        <div className="form-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate("/doi-tac")}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
          >
            Tạo chuyến xe
          </button>
        </div>
      </div>
    </div>
  );
}
