import React, { useEffect, useState } from "react";

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/partners")
      .then(res => res.json())
      .then(data => setPartners(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Quản lý Nhà xe</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {partners.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.isActive ? "Hoạt động" : "Khóa"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPartners;