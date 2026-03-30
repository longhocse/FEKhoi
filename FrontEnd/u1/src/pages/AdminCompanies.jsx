import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    logo: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Hàm reset form - THÊM HÀM NÀY
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      logo: ''
    });
    setEditingCompany(null);
    setModalError("");
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log("🔄 Đang gọi API companies...");

      const response = await axios.get('http://localhost:5000/api/admin/companies');

      console.log("✅ API response:", response);
      console.log("✅ Data nhận được:", response.data);

      if (response.data.success) {
        console.log("📊 Số lượng nhà xe:", response.data.data.length);
        setCompanies(response.data.data);
      } else {
        setError(response.data.error || 'Lỗi không xác định');
      }
    } catch (err) {
      console.error("❌ Lỗi fetch:", err);

      if (err.response) {
        setError(`Lỗi ${err.response.status}: ${err.response.data.error || err.response.statusText}`);
        console.error("Response error:", err.response.data);
      } else if (err.request) {
        setError("Không thể kết nối đến server. Kiểm tra backend đã chạy chưa?");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm xử lý sửa nhà xe
  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      taxCode: company.taxCode || '',
      logo: company.logo || ''
    });
    setShowModal(true);
    setModalError("");
  };

  // Hàm xử lý xóa nhà xe
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà xe này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/admin/companies/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Xóa nhà xe thành công!");
        fetchCompanies();
      } catch (err) {
        console.error("Lỗi xóa:", err);
        alert(err.response?.data?.message || "Xóa thất bại");
      }
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setModalError("");

    try {
      const token = localStorage.getItem("token");

      if (editingCompany) {
        // Cập nhật
        await axios.put(
          `http://localhost:5000/api/admin/companies/${editingCompany.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Cập nhật nhà xe thành công!");
      } else {
        // Thêm mới
        await axios.post(
          "http://localhost:5000/api/admin/companies",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Thêm nhà xe thành công!");
      }

      resetForm();
      setShowModal(false);
      fetchCompanies();

    } catch (err) {
      console.error("Lỗi submit:", err);
      setModalError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
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
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" onClick={fetchCompanies}>
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Quản lý Nhà xe</h2>
          <p className="text-muted">Tổng số: {companies.length} nhà xe</p>
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
            Thêm nhà xe
          </Button>
        </Col>
      </Row>

      {/* Danh sách nhà xe */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Danh sách nhà xe</h5>
        </Card.Header>
        <Card.Body>
          {companies.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-building fs-1 text-muted d-block mb-3"></i>
              <h5>Chưa có nhà xe nào</h5>
              <p className="text-muted">Nhấn "Thêm nhà xe" để tạo mới</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Logo</th>
                  <th>Tên nhà xe</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                      ) : (
                        <i className="bi bi-building fs-4"></i>
                      )}
                    </td>
                    <td className="fw-bold">{company.name}</td>
                    <td>{company.email}</td>
                    <td>{company.phone}</td>
                    <td>{company.address}</td>
                    <td>
                      <Badge bg={company.isActive ? 'success' : 'secondary'}>
                        {company.isActive ? 'Hoạt động' : 'Ngừng'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(company)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(company.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal thêm/sửa nhà xe */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCompany ? "Sửa nhà xe" : "Thêm nhà xe mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên nhà xe *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã số thuế</Form.Label>
                  <Form.Control
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Logo URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" type="button" onClick={resetForm}>
                <i className="bi bi-arrow-repeat me-2"></i>
                Reset
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={submitLoading}>
                {submitLoading ? "Đang xử lý..." : (editingCompany ? "Cập nhật" : "Thêm mới")}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Debug card */}
      <Card className="bg-light mt-3">
        <Card.Body>
          <details>
            <summary className="text-muted">Xem dữ liệu thô (debug)</summary>
            <pre className="mb-0 small mt-2">
              {JSON.stringify(companies, null, 2)}
            </pre>
          </details>
        </Card.Body>
      </Card>
    </Container>
  );
}
