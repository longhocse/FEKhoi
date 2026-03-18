import { useEffect, useState } from "react";
import axios from "axios";

export default function PartnerSettings() {
  const [form, setForm] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/partner/settings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setForm(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.put("http://localhost:5000/api/partner/settings", form, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    alert("Cập nhật thành công");
  };

  return (
    <div>
      <h2>⚙️ Cài đặt</h2>

      <form onSubmit={handleSubmit}>
        <input value={form.name || ""} 
          onChange={e => setForm({...form, name: e.target.value})}
          placeholder="Tên nhà xe" />

        <input value={form.phoneNumber || ""} 
          onChange={e => setForm({...form, phoneNumber: e.target.value})}
          placeholder="SĐT" />

        <input value={form.companyAddress || ""} 
          onChange={e => setForm({...form, companyAddress: e.target.value})}
          placeholder="Địa chỉ" />

        <button type="submit">Lưu</button>
      </form>
    </div>
  );
}