import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  Badge
} from "react-bootstrap";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "customer",
  });
  const [editingId, setEditingId] = useState(null);

  const API = "http://localhost:5000/api/users";

  /* ================= FETCH USERS ================= */
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

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (id) => {
    await fetch(`${API}/${id}/toggle`, { method: "PATCH" });
    fetchUsers();
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "customer",
    });

    setEditingId(null);
    fetchUsers();
  };

  /* ================= EDIT ================= */
  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      password: "",
    });
    setEditingId(user.id);
  };

  return (
    <Container className="mt-4">
      <Row>
        {/* ================= FORM ================= */}
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>
                {editingId ? "Cập nhật người dùng" : "Thêm người dùng"}
              </Card.Title>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Group>

                {!editingId && (
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="customer">Customer</option>
                    <option value="partner">Partner</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* ================= TABLE ================= */}
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Danh sách người dùng</Card.Title>

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
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
                      <td>{u.phoneNumber || "-"}</td>
                      <td>
                        <Badge bg="info">{u.role}</Badge>
                      </td>
                      <td>
                        <Badge bg={u.isActive ? "success" : "danger"}>
                          {u.isActive ? "Hoạt động" : "Khóa"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => handleEdit(u)}
                        >
                          Sửa
                        </Button>

                        <Button
                          size="sm"
                          variant={u.isActive ? "secondary" : "success"}
                          className="me-2"
                          onClick={() => toggleStatus(u.id)}
                        >
                          {u.isActive ? "Khóa" : "Mở"}
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteUser(u.id)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}