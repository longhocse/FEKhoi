// src/pages/Profile.jsx
import { Container, Card, Form, Button, Row, Col, Alert, Tab, Tabs } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { currentPassword, newPassword, confirmPassword, ...profileData } = formData;
      await updateProfile(profileData);
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      setEditMode(false);
    } catch (error) {
      setMessage({ type: "danger", text: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validate
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "danger", text: "Mật khẩu xác nhận không khớp" });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "danger", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      setLoading(false);
      return;
    }

    // Giả lập API call thay đổi mật khẩu
    setTimeout(() => {
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setLoading(false);
    }, 1000);
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Vui lòng đăng nhập để xem thông tin cá nhân
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="section-title mb-4">Thông tin cá nhân</h1>

      {message.text && (
        <Alert variant={message.type} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Card className="soft-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">Thông tin tài khoản</h4>
              {!editMode && (
                <Button variant="outline-primary" onClick={() => setEditMode(true)}>
                  <i className="bi bi-pencil me-2"></i>
                  Chỉnh sửa
                </Button>
              )}
            </div>

            {editMode ? (
              <Form onSubmit={handleUpdateProfile}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Email không thể thay đổi
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        ...formData,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || ""
                      });
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="profile-info">
                <div className="d-flex align-items-center mb-4">
                  <div className="profile-avatar bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center me-4" 
                    style={{ width: 80, height: 80, fontSize: '2rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="mb-1">{user.name}</h4>
                    <p className="text-muted mb-0">{user.email}</p>
                    {user.phone && <p className="text-muted mb-0">{user.phone}</p>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="fw-semibold">Ngày tham gia:</div>
                    <div>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="fw-semibold">Số vé đã đặt:</div>
                    <div>0 vé</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Đổi mật khẩu */}
          <Card className="soft-card p-4 mt-4">
            <h4 className="mb-3">Đổi mật khẩu</h4>
            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu hiện tại</Form.Label>
                <Form.Control
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                <Form.Control
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Menu bên phải */}
          <Card className="soft-card p-4">
            <h5 className="mb-3">Tài khoản của bạn</h5>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-ticket-perforated me-2"></i>
                Vé của tôi
              </Button>
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-heart me-2"></i>
                Tuyến yêu thích
              </Button>
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-bell me-2"></i>
                Thông báo
              </Button>
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-shield-check me-2"></i>
                Bảo mật
              </Button>
              <Button 
                variant="outline-danger" 
                className="text-start mt-3"
                onClick={logout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
              </Button>
            </div>
          </Card>

          {/* Thống kê */}
          <Card className="soft-card p-4 mt-4">
            <h5 className="mb-3">Thống kê</h5>
            <div className="d-flex justify-content-between mb-2">
              <span>Tổng số vé:</span>
              <span className="fw-bold">0</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Đang chờ thanh toán:</span>
              <span className="fw-bold">0</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Đã thanh toán:</span>
              <span className="fw-bold">0</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Đã hủy:</span>
              <span className="fw-bold">0</span>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}