import "../styles/partner.css";

export default function CreateTrip() {
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
              <input placeholder="Ví dụ: Hà Nội" />
            </div>
            <div>
              <label>Điểm đến *</label>
              <input placeholder="Ví dụ: Hải Phòng" />
            </div>
          </div>
        </div>

        {/* ===== TIME INFO ===== */}
        <div className="form-card">
          <h3>⏰ Thông tin thời gian</h3>
          <div className="form-grid">
            <div>
              <label>Ngày khởi hành *</label>
              <input type="date" />
            </div>
            <div>
              <label>Giờ khởi hành *</label>
              <input type="time" />
            </div>
            <div>
              <label>Thời gian đến dự kiến *</label>
              <input type="time" />
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
                <input type="checkbox" /> {s}
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
              <input placeholder="Ví dụ: 250000" />
            </div>
          </div>
        </div>

        {/* ===== BUS INFO ===== */}
        <div className="form-card">
          <h3>🚍 Thông tin xe</h3>
          <div className="form-grid">
            <div>
              <label>Loại xe *</label>
              <select>
                <option>Chọn loại xe</option>
                <option>Giường nằm</option>
                <option>Limousine</option>
                <option>Ghế ngồi</option>
              </select>
            </div>
            <div>
              <label>Tình trạng xe *</label>
              <select>
                <option>Chọn tình trạng</option>
                <option>Mới</option>
                <option>Đang hoạt động</option>
              </select>
            </div>
            <div>
              <label>Biển số xe *</label>
              <input placeholder="Ví dụ: 29A-12345" />
            </div>
            <div>
              <label>Số ghế *</label>
              <input placeholder="Ví dụ: 40" />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Mô tả thêm (tuỳ chọn)</label>
            <textarea
              rows={3}
              placeholder="Thông tin bổ sung về xe, tài xế, chính sách..."
            />
          </div>
        </div>

        {/* ===== ACTION ===== */}
        <div className="form-actions">
          <button className="btn-secondary">Hủy</button>
          <button className="btn-primary">Tạo chuyến xe</button>
        </div>
      </div>
    </div>
  );
}
