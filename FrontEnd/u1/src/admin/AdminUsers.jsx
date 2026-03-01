import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [editingId, setEditingId] = useState(null);

  const API = "http://localhost:5000/api/users";

  /* ================= FETCH ================= */
  const fetchUsers = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= DELETE ================= */
  const deleteUser = async (id) => {
    if (!window.confirm("Xóa user này?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleStatus = async (id) => {
    await fetch(`${API}/${id}/toggle`, {
      method: "PATCH",
    });
    fetchUsers();
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      // UPDATE
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      // CREATE
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ name: "", email: "", password: "", role: "customer" });
    setEditingId(null);
    fetchUsers();
  };

  /* ================= EDIT ================= */
  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setEditingId(user.id);
  };

  return (
    <div>
      <h2>Quản lý người dùng</h2>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          name="name"
          placeholder="Tên"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {!editingId && (
          <input
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
          />
        )}

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="customer">Customer</option>
          <option value="partner">Partner</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">
          {editingId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      {/* ===== TABLE ===== */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Role</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <span
                  style={{
                    color: u.isActive ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {u.isActive ? "Hoạt động" : "Khóa"}
                </span>
              </td>
              <td>
                <button onClick={() => handleEdit(u)}>Sửa</button>
                <button onClick={() => toggleStatus(u.id)}>
                  {u.isActive ? "Khóa" : "Mở"}
                </button>
                <button onClick={() => deleteUser(u.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}