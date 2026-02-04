import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";

export default function Partner() {
  return (
    <Container className="py-4">
      <h3 className="section-title mb-3">Dành cho Nhà Xe</h3>

      <Row className="g-3">
        <Col lg={7}>
          <Card className="soft-card p-4">
            <h5 className="fw-bold">Vì sao hợp tác với BUSGO?</h5>
            <ul className="text-muted mb-0">
              <li>Quản lý tuyến, ghế, giá vé tập trung</li>
              <li>Hỗ trợ marketing & bán vé online</li>
              <li>Báo cáo doanh thu minh bạch</li>
            </ul>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="soft-card p-4">
            <h5 className="fw-bold">Đăng ký làm đối tác</h5>
            <Form className="mt-3">
              <Form.Group className="mb-2">
                <Form.Label>Tên nhà xe</Form.Label>
                <Form.Control />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control />
              </Form.Group>
              <Button className="pill px-4 mt-2" variant="primary">Gửi đăng ký</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
