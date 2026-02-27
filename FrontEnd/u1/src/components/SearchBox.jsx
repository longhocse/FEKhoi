import { Card, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SearchBox() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    const q = new URLSearchParams({ from, to, date }).toString();
    navigate(`/tuyen-xe?${q}`);
  };

  return (
    <Card className="soft-card p-3">
      <Form onSubmit={onSearch}>
        <Row className="g-2 align-items-center">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text><i className="bi bi-geo-alt" /></InputGroup.Text>
              <Form.Control
                placeholder="Điểm đi"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text><i className="bi bi-flag" /></InputGroup.Text>
              <Form.Control
                placeholder="Điểm đến"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={2}>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Col>

          <Col md={2} className="d-grid">
            <Button type="submit" variant="primary" className="pill">
              <i className="bi bi-search me-2" />
              Tìm chuyến
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
