import { Container, Row, Col } from "react-bootstrap";

export default function AppFooter() {
  return (
    <footer className="bg-secondary-custom text-white mt-5">
      <Container className="py-4">
        <Row className="g-4">
          <Col md={4}>
            <div className="fw-bold">
              <i className="bi bi-bus-front me-2" />
              BUGO
            </div>
            <div className="text-white-50 small mt-2">
              Nền tảng đặt vé xe khách trực tuyến.
            </div>
          </Col>

          <Col md={4}>
            <div className="fw-semibold mb-2">Hỗ trợ</div>
            <div className="text-white-50 small">Hotline: 1900-xxxx</div>
            <div className="text-white-50 small">Email: support@bugo.vn</div>
          </Col>

          <Col md={4}>
            <div className="fw-semibold mb-2">Tải ứng dụng</div>
            <div className="text-white-50 small">App Store / Google Play (demo)</div>
          </Col>
        </Row>

        <hr className="border-white border-opacity-25 my-4" />
        <div className="text-center text-white-50 small">
          © {new Date().getFullYear()} BUGO. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
