import { useState } from "react";
import axios from "axios";

export default function AdminSettings() {
  const [password, setPassword] = useState("");
  const [fee, setFee] = useState(10);
  const [message, setMessage] = useState("");

  const changePassword = async () => {
    try {
      await axios.put("http://localhost:5000/api/admin/change-password", {
        password
      });
      setMessage("Đổi mật khẩu thành công");
    } catch (err) {
      setMessage("Lỗi đổi mật khẩu");
    }
  };

  const saveFee = async () => {
    try {
      await axios.put("http://localhost:5000/api/admin/system-config", {
        fee
      });
      setMessage("Lưu cấu hình thành công");
    } catch (err) {
      setMessage("Lỗi lưu cấu hình");
    }
  };

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">⚙️ Cài đặt hệ thống</h3>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row">

        {/* Đổi mật khẩu */}
        <div className="col-md-6">
          <div className="card shadow border-0 mb-4">
            <div className="card-body">
              <h5>🔐 Đổi mật khẩu</h5>
              <input
                type="password"
                className="form-control my-3"
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="btn btn-primary" onClick={changePassword}>
                Cập nhật
              </button>
            </div>
          </div>
        </div>

        {/* Cấu hình phí */}
        <div className="col-md-6">
          <div className="card shadow border-0 mb-4">
            <div className="card-body">
              <h5>💰 Cấu hình phí (%)</h5>
              <input
                type="number"
                className="form-control my-3"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
              <button className="btn btn-success" onClick={saveFee}>
                Lưu
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}