import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";

export default function AdminDashboard() {
  const stats = {
    activeTrips: 10,
    todayRevenue: 21340000,
    ticketsSold: 42
  };

  const recentTrips = [
    { id: "B-1024", route: "Đà Nẵng → Hồ Chí Minh", time: "08:00 sáng", status: "Departed" },
    { id: "B-2055", route: "Hà Nội → Hồ Chí Minh", time: "09:30 sáng", status: "Boarding" },
    { id: "B-1088", route: "Hồ Chí Minh → Huế", time: "11:00 sáng", status: "Scheduled" },
  ];

  return (
    <Container className="py-4">
      <h1 className="mb-4">BusGo</h1>

      {/* Trang tổng hợp dữ liệu */}
      <Card className="soft-card mb-4 p-4">
        <h4 className="mb-3">Trang tổng hợp dữ liệu</h4>
        <ul className="mb-0">
          <li>Lịch trình</li>
          <li>Quản lý đội xe</li>
          <li>Cài đặt</li>
        </ul>
      </Card>

      <hr className="my-5" />

      {/* Tổng quan điều hành */}
      <h2 className="mb-4">Tổng quan điều hành</h2>

      {/* Xin chào và thống kê */}
      <Card className="soft-card mb-5 p-4 bg-secondary-custom text-white">
        <h4 className="mb-3">Xin chào, điều hành viên</h4>
        <p className="mb-4 opacity-75">Đây là tổng quan hoạt động đội xe hôm nay.</p>
        
        <Row className="g-4">
          <Col md={4}>
            <div className="text-center">
              <div className="display-5 fw-bold">{stats.activeTrips}</div>
              <div className="opacity-75">CHUYẾN XE ĐANG HOẠT ĐỘNG</div>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="text-center">
              <div className="display-5 fw-bold">{stats.todayRevenue.toLocaleString("vi-VN")} VND</div>
              <div className="opacity-75">DOANH THU HÔM NAY</div>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="text-center">
              <div className="display-5 fw-bold">{stats.ticketsSold}</div>
              <div className="opacity-75">SỐ VÉ ĐÃ BÁN</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Bảng điều khiển quản lý */}
      <h3 className="mb-4">Bảng điều khiển quản lý</h3>
      <Row className="g-4 mb-5">
        <Col lg={3} md={6}>
          <Card className="soft-card h-100 p-4">
            <h5 className="mb-3">Tạo chuyến xe</h5>
            <p className="small text-muted mb-4">
              Lên lịch chuyến mới, phân công tài xế và quản lý tuyến đường.
            </p>
            <Button variant="primary" className="pill px-4">
              Bắt đầu ngay →
            </Button>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="soft-card h-100 p-4">
            <h5 className="mb-3">Thông tin doanh nghiệp</h5>
            <p className="small text-muted mb-4">
              Cập nhật nhận diện thương hiệu, thông tin liên hệ và tiện ích trên xe.
            </p>
            <Button variant="outline-primary" className="pill px-4">
              Chỉnh sửa thông tin →
            </Button>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="soft-card h-100 p-4">
            <h5 className="mb-3">Rút tiền</h5>
            <p className="small text-muted mb-4">
              Quản lý thu nhập, xem số dư ví và yêu cầu rút tiền.
            </p>
            <Button variant="outline-primary" className="pill px-4">
              View Wallet →
            </Button>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="soft-card h-100 p-4">
            <h5 className="mb-3">Báo cáo và Phân tích</h5>
            <p className="small text-muted mb-4">
              Phân tích doanh số bán vé, tỷ lệ lấp đầy chỗ ngồi và các báo cáo tài chính.
            </p>
            <Button variant="outline-primary" className="pill px-4">
              Xem dữ liệu →
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Chuyến khởi hành gần đây */}
      <h3 className="mb-3">Chuyến khởi hành gần đây</h3>
      <Row className="g-3">
        {recentTrips.map((trip) => (
          <Col md={4} key={trip.id}>
            <Card className="soft-card p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">{trip.id}</h6>
                <Badge 
                  bg={trip.status === "Departed" ? "secondary" : 
                      trip.status === "Boarding" ? "warning" : "info"}
                  className="pill px-3"
                >
                  {trip.status}
                </Badge>
              </div>
              <div className="fw-semibold">{trip.route}</div>
              <div className="text-muted small">⏰ {trip.time}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Nút đăng xuất */}
      <div className="text-center mt-5">
        <Button variant="outline-danger" className="pill px-5 py-2">
          Đăng xuất
        </Button>
      </div>
    </Container>
  );
}