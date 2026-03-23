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
        // Server có response nhưng lỗi
        setError(`Lỗi ${err.response.status}: ${err.response.data.error || err.response.statusText}`);
        console.error("Response error:", err.response.data);
      } else if (err.request) {
        // Không nhận được response
        setError("Không thể kết nối đến server. Kiểm tra backend đã chạy chưa?");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
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