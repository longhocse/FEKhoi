import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PartnerLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // role = partner
      await login(email, password, "partner");
      navigate("/nha-xe"); // ✅ ĐÚNG ROUTE
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 520 }}>
      <Card className="p-4">
        <h3 className="mb-3">Đăng nhập nhà xe</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email nhà xe</Form.Label>
            <Form.Control
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" className="w-100">
            Đăng nhập nhà xe
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
