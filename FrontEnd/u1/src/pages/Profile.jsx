// src/pages/Profile.jsx
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const { user, updateProfile, logout, changePassword, token } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userStats, setUserStats] = useState({
    totalTickets: 0,
    bookedTickets: 0,
    paidTickets: 0,
    cancelledTickets: 0,
    usedTickets: 0
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Lấy thống kê vé từ backend
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setStatsLoading(true);
        const response = await axios.get(`${API_URL}/tickets/my-tickets`, {
          headers: getHeaders()
        });

        if (response.data.success) {
          const tickets = response.data.data || [];

          // Thống kê theo trạng thái
          const stats = {
            totalTickets: tickets.length,
            bookedTickets: tickets.filter(t => t.status === 'BOOKED').length,
            paidTickets: tickets.filter(t => t.status === 'PAID').length,
            cancelledTickets: tickets.filter(t => t.status === 'CANCELLED').length,
            usedTickets: tickets.filter(t => t.status === 'USED').length
          };

          setUserStats(stats);
        }
      } catch (err) {
        console.error("Lỗi lấy thống kê vé:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  // Cập nhật formData khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || user.phone || ""
      }));
    }
  }, [user]);

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
      // Gọi API cập nhật profile
      const response = await axios.put(
        `${API_URL}/users/profile`,
        {
          name: formData.name,
          phoneNumber: formData.phoneNumber
        },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Cập nhật lại user trong context
        await updateProfile({ name: formData.name, phone: formData.phoneNumber });

        setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
        setEditMode(false);
      } else {
        setMessage({ type: "danger", text: response.data.message || "Cập nhật thất bại" });
      }
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      setMessage({ type: "danger", text: error.response?.data?.message || "Cập nhật thất bại" });
    }

    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

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

    try {
      await changePassword(formData.currentPassword, formData.newPassword);

      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });

      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (error) {
      setMessage({ type: "danger", text: error.message || "Đổi mật khẩu thất bại" });
    }

    setLoading(false);
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
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
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
                        phoneNumber: user.phoneNumber || user.phone || ""
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
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff&size=128`}
                    alt="avatar"
                    className="profile-avatar bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center me-4"
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                  />
                  <div>
                    <h4 className="mb-1">{user.name}</h4>
                    <p className="text-muted mb-0">{user.email}</p>
                    {user.phoneNumber && <p className="text-muted mb-0">{user.phoneNumber}</p>}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="fw-semibold">Ngày tham gia:</div>
                    <div>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "Đang cập nhật"}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="fw-semibold">Vai trò:</div>
                    <div className="badge bg-primary">
                      {user.role === 'customer' ? 'Khách hàng' :
                        user.role === 'partner' ? 'Nhà xe' :
                          user.role === 'admin' ? 'Quản trị viên' : user.role}
                    </div>
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
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                <Form.Control
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
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
              <Button
                variant="outline-primary"
                className="text-start"
                onClick={() => window.location.href = "/ve-cua-toi"}
              >
                <i className="bi bi-ticket-perforated me-2"></i>
                Vé của tôi
              </Button>
              <Button
                variant="outline-info"
                className="text-start"
                onClick={() => window.location.href = "/vi"}
              >
                <i className="bi bi-wallet2 me-2"></i>
                Ví điện tử
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
            <h5 className="mb-3">Thống kê đặt vé</h5>
            {statsLoading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <p className="mt-2 text-muted small">Đang tải...</p>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tổng số vé:</span>
                  <span className="fw-bold">{userStats.totalTickets}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Chờ thanh toán:</span>
                  <span className="fw-bold text-warning">{userStats.bookedTickets}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Đã thanh toán:</span>
                  <span className="fw-bold text-success">{userStats.paidTickets}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Đã sử dụng:</span>
                  <span className="fw-bold text-info">{userStats.usedTickets}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Đã hủy:</span>
                  <span className="fw-bold text-danger">{userStats.cancelledTickets}</span>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}