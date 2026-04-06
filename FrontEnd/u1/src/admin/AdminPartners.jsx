import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Spinner,
  Button
} from "react-bootstrap";

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = () => {
    fetch("http://localhost:5000/api/admin/partners")
      .then(res => res.json())
      .then(data => {
        setPartners(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const toggleStatus = async (id) => {
    await fetch(`http://localhost:5000/api/admin/partners/${id}/toggle`, {
      method: "PATCH"
    });
    fetchPartners();
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Card.Title>Quản lý Nhà xe</Card.Title>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      Chưa có nhà xe
                    </td>
                  </tr>
                ) : (
                  partners.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>
                        <Badge bg={p.isActive ? "success" : "danger"}>
                          {p.isActive ? "Hoạt động" : "Khóa"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant={p.isActive ? "secondary" : "success"}
                          onClick={() => toggleStatus(p.id)}
                        >
                          {p.isActive ? "Khóa" : "Mở"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminPartners;