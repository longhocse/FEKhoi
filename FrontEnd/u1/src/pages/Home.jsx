import { Container, Row, Col, Card, Button } from "react-bootstrap";
import SearchBox from "../components/SearchBox";
import RouteCard from "../components/RouteCard";
import { popularRoutes } from "../data/mockRoutes";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <div className="hero py-5">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={7} className="text-white">
              <h1 className="display-5 fw-bold">
                Hành trình an toàn, <span>Kết nối mọi nơi</span>
              </h1>
              <p className="text-white-50 mb-4">
                Đặt vé xe khách trực tuyến dễ dàng, nhanh chóng cùng BUSGO.
              </p>
              <SearchBox />
            </Col>

            <Col lg={5} className="d-none d-lg-block">
              <Card className="soft-card p-4">
                <div className="fw-bold section-title mb-2">Ưu điểm nổi bật</div>
                <div className="d-flex gap-3 align-items-start mb-3">
                  <i className="bi bi-shield-check fs-3 text-primary-custom" />
                  <div>
                    <div className="fw-semibold">Thanh toán an toàn</div>
                    <div className="text-muted small">Bảo mật và xác thực rõ ràng</div>
                  </div>
                </div>
                <div className="d-flex gap-3 align-items-start mb-3">
                  <i className="bi bi-headset fs-3 text-primary-custom" />
                  <div>
                    <div className="fw-semibold">Hỗ trợ 24/7</div>
                    <div className="text-muted small">Luôn có mặt khi bạn cần</div>
                  </div>
                </div>
                <div className="d-flex gap-3 align-items-start">
                  <i className="bi bi-ticket-perforated fs-3 text-primary-custom" />
                  <div>
                    <div className="fw-semibold">Vé điện tử tiện lợi</div>
                    <div className="text-muted small">Không cần in, lên xe nhanh</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* TUYẾN PHỔ BIẾN */}
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title m-0">Tuyến đường phổ biến</h3>
          <Button variant="link" className="text-primary-custom fw-semibold" onClick={() => navigate("/tuyen-xe")}>
            Xem tất cả <i className="bi bi-arrow-right" />
          </Button>
        </div>

        <Row className="g-3">
          {popularRoutes.map((r) => (
            <Col key={r.id} lg={3} md={6}>
              <RouteCard item={r} />
            </Col>
          ))}
        </Row>

        {/* ƯU ĐÃI */}
        <h3 className="section-title mt-5 mb-3 text-center">Ưu đãi độc quyền</h3>
        <Row className="g-3">
          <Col md={6}>
            <Card className="soft-card p-4" style={{ background: "#FF6B35", color: "white" }}>
              <div className="fw-bold fs-5">Giảm 50k cho khách mới</div>
              <div className="opacity-75 small">Nhập mã BUSGO50 khi đặt vé</div>
              <Button className="mt-3 pill" variant="light">Dùng ngay</Button>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="soft-card p-4 bg-secondary-custom text-white">
              <div className="fw-bold fs-5">Hoàn tiền 10%</div>
              <div className="opacity-75 small">Áp dụng cho một số tuyến (tùy thời điểm)</div>
              <Button className="mt-3 pill" variant="primary">Đặt ngay</Button>
            </Card>
          </Col>
        </Row>

        {/* DÀNH CHO NHÀ XE */}
        <Card className="soft-card p-4 mt-5 bg-secondary-custom text-white">
          <Row className="align-items-center g-3">
            <Col md={8}>
              <div className="fw-bold fs-4">Dành cho Nhà Xe</div>
              <div className="text-white-50">
                Mở rộng quy mô kinh doanh, quản lý lịch trình & doanh thu thông minh cùng BUSGO.
              </div>
            </Col>
            <Col md={4} className="d-flex gap-2 justify-content-md-end">
              <Button className="pill px-3" variant="primary" onClick={() => navigate("/doi-tac")}>
                Đăng ký làm đối tác
              </Button>
              <Button className="pill px-3" variant="outline-light" onClick={() => navigate("/doi-tac")}>
                Tìm hiểu thêm
              </Button>
            </Col>
          </Row>
        </Card>
      </Container>
    </>
  );
}
