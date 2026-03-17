import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'customer'
  });

  // Lấy danh sách users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thêm/sửa user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Cập nhật user
        await axios.put(`http://localhost:5000/api/admin/users/${editingUser.id}`, formData);
      } else {
        // Thêm user mới
        await axios.post('http://localhost:5000/api/admin/users', formData);
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers(); // Tải lại danh sách
    } catch (err) {
      alert('Lỗi: ' + err.response?.data?.error || err.message);
    }
  };

  // Xóa user
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn vô hiệu hóa người dùng này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'customer'
    });
    setEditingUser(null);
  };

  // Mở modal để sửa
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: '',
      role: user.role
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Lỗi: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Quản lý người dùng</h2>
        </Col>
        <Col className="text-end">
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Thêm người dùng
          </Button>
        </Col>
      </Row>

      {/* Form thêm mới */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Thêm người dùng mới</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập SĐT"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="customer">Customer</option>
                    <option value="partner">Partner</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit">
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </Button>
            {editingUser && (
              <Button variant="secondary" className="ms-2" onClick={resetForm}>
                Hủy
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Danh sách người dùng */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Danh sách người dùng</h5>
        </Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Role</th>
                <th>Số dư</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    <Badge bg={
                      user.role === 'admin' ? 'danger' :
                      user.role === 'partner' ? 'success' : 'info'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td>{user.balance?.toLocaleString()}đ</td>
                  <td>
                    <Badge bg={user.isActive ? 'success' : 'secondary'}>
                      {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    Chưa có người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}