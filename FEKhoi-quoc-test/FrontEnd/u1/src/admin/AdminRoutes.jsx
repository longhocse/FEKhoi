// src/admin/AdminRoutes.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert, Badge } from "react-bootstrap";
import axios from "axios";

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({ name: "", address: "", province: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/routes`, { headers: getHeaders() });
      if (response.data.success) {
        setRoutes(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Lỗi tải tuyến đường:", err);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({ name: route.name, address: route.address, province: route.province });
    } else {
      setEditingRoute(null);
      setFormData({ name: "", address: "", province: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingRoute) {
        await axios.put(`${API_URL}/admin/routes/${editingRoute.id}`, formData, { headers: getHeaders() });
        alert("Cập nhật tuyến đường thành công");
      } else {
        await axios.post(`${API_URL}/admin/routes`, formData, { headers: getHeaders() });
        alert("Thêm tuyến đường thành công");
      }
      setShowModal(false);
      fetchRoutes();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tuyến đường này?")) return;
    try {
      await axios.delete(`${API_URL}/admin/routes/${id}`, { headers: getHeaders() });
      alert("Xóa thành công");
      fetchRoutes();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên trạm";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Tên trạm quá ngắn";
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    // Province
    if (!formData.province.trim()) {
      newErrors.province = "Vui lòng nhập tỉnh/thành phố";
    } else if (!/^[A-Za-zÀ-ỹ\s]+$/.test(formData.province)) {
      newErrors.province = "Tỉnh/TP không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
          Quản lý tuyến đường
        </h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-lg me-2"></i>
          Thêm tuyến đường
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên trạm</th>
                  <th>Địa chỉ</th>
                  <th>Tỉnh/Thành phố</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {routes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                      Không có tuyến đường nào
                    </td>
                  </tr>
                ) : (
                  routes.map((route) => (
                    <tr key={route.id}>
                      <td className="fw-bold">#{route.id}</td>
                      <td>{route.name}</td>
                      <td>{route.address}</td>
                      <td><Badge bg="info">{route.province}</Badge></td>
                      <td>{new Date(route.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(route)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(route.id)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingRoute ? "Chỉnh sửa tuyến đường" : "Thêm tuyến đường mới"}</Modal.Title>
        </Modal.Header>
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên trạm</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="VD: Bến xe Giáp Bát"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                isInvalid={!!errors.address}
                placeholder="VD: Giải Phóng, Hà Nội"
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tỉnh/Thành phố</Form.Label>
              <Form.Control
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="VD: Hà Nội"
                isInvalid={!!errors.province}
              />
              <Form.Control.Feedback type="invalid">
                {errors.province}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Đang xử lý..." : (editingRoute ? "Cập nhật" : "Thêm mới")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}