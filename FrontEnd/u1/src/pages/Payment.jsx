import { Container, Card, Row, Col, Form, Button, Badge, ListGroup, Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Payment() {
  const navigate = useNavigate();
  
  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <h1 className="mb-4">Phương thức thanh toán</h1>

      {/* QR chuyển khoản */}
      <Card className="soft-card mb-4 p-4">
        <h4 className="mb-3">QR chuyển khoản/ Ví điện tử</h4>
        <p className="text-muted mb-4">
          Không cần nhập thông tin. Xác nhận thanh toán tức thì, nhanh chóng và ít sai sót.
        </p>
        
        <div className="mb-3">
          <div className="text-muted small mb-2">Hỗ trợ hầu hết ví điện tử & ngân hàng</div>
          <div className="d-flex flex-wrap gap-2">
            <Badge bg="light" text="dark" className="px-3 py-2 border">mob</Badge>
            <Badge bg="light" text="dark" className="px-3 py-2 border">mobile</Badge>
            <Badge bg="light" text="dark" className="px-3 py-2 border">SAMSUNG</Badge>
            <Badge bg="light" text="dark" className="px-3 py-2 border">ACB</Badge>
            <Badge bg="secondary-custom" className="px-3 py-2">Xem tất cả</Badge>
          </div>
        </div>
        
        {/* QR Code Placeholder */}
        <div className="text-center mt-4">
          <div style={{ 
            width: 200, 
            height: 200, 
            margin: '0 auto',
            background: '#f8f9fa',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #dee2e6'
          }}>
            <div className="text-muted">QR Code Placeholder</div>
          </div>
          <p className="text-muted small mt-2">Quét mã để thanh toán</p>
        </div>
        
        <Button variant="primary" className="pill px-4 mt-3">
          Xác nhận đã thanh toán
        </Button>
      </Card>

      {/* Ví MoMo */}
      <Card className="soft-card mb-4 p-4">
        <h4 className="mb-3">Ví MoMo</h4>
        <p className="text-muted mb-4">Điện thoại của bạn phải được cài đặt ứng dụng MoMo</p>
        
        <div className="mb-3">
          <div className="fw-semibold mb-1">Nhập mã MOMOVXR tại MoMo để nhận ...</div>
          <div className="text-muted small">Giảm 20K cho đơn từ 400K. SL có ...</div>
          <div className="text-muted small">Thời gian: 15/01 - 31/03</div>
        </div>
        
        <div className="mb-4">
          <div className="fw-semibold mb-1">Nhập mã MOMOVXRTET tại MoMo để nh...</div>
          <div className="text-muted small">Giảm 5K cho đơn từ 800K. SL có hạn</div>
          <div className="text-muted small">Thời gian: 15/01 - 28/02</div>
        </div>
        
        <Button variant="outline-primary" className="pill px-4">
          Thanh toán bằng MoMo
        </Button>
      </Card>

      {/* Accordion cho các phương thức khác */}
      <Accordion className="mb-4">
        {/* Thẻ thanh toán quốc tế */}
        <Accordion.Item eventKey="0" className="soft-card mb-2 border-0">
          <Accordion.Header>
            <div className="fw-bold">Thẻ thanh toán quốc tế</div>
          </Accordion.Header>
          <Accordion.Body>
            <p className="text-muted mb-3">Thẻ Visa, MasterCard, JCB</p>
            
            <ListGroup variant="flush" className="mb-3">
              <ListGroup.Item className="border-0 px-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="fw-bold">Giảm 50k</div>
                    <div className="text-muted small">Đơn hàng tối thiểu 250k</div>
                  </div>
                  <Badge bg="warning" text="dark" className="pill px-3">
                    HSD: 23.59 - T7, 28/02
                  </Badge>
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="border-0 px-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">Giảm 100k</div>
                    <div className="text-muted small">Đơn hàng tối thiểu 500k</div>
                  </div>
                  <Badge bg="warning" text="dark" className="pill px-3">
                    HSD: 12.23 - T7, 28/02 12:23
                  </Badge>
                </div>
              </ListGroup.Item>
            </ListGroup>
            
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Số thẻ</Form.Label>
                <Form.Control placeholder="1234 5678 9012 3456" />
              </Form.Group>
              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Ngày hết hạn</Form.Label>
                    <Form.Control placeholder="MM/YY" />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>CVV</Form.Label>
                    <Form.Control placeholder="123" />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="outline-primary" className="w-100 pill">
                Thanh toán bằng thẻ
              </Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>

        {/* Thẻ ATM nội địa */}
        <Accordion.Item eventKey="1" className="soft-card mb-2 border-0">
          <Accordion.Header>
            <div className="fw-bold">Thẻ ATM nội địa / Internet Banking</div>
          </Accordion.Header>
          <Accordion.Body>
            <p className="text-muted mb-3">Tài khoản phải có đăng ký Internet banking</p>
            
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Badge bg="light" text="dark" className="px-3 py-2 border">Vietcombank</Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 border">Techcombank</Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 border">BIDV</Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 border">Agribank</Badge>
              <Badge bg="secondary-custom" className="px-3 py-2">Xem tất cả</Badge>
            </div>
            
            <Button variant="outline-primary" className="w-100 pill">
              Chọn ngân hàng
            </Button>
          </Accordion.Body>
        </Accordion.Item>

        {/* VNPAY - QR */}
        <Accordion.Item eventKey="2" className="soft-card mb-2 border-0">
          <Accordion.Header>
            <div className="fw-bold">Thanh toán VNPAY - QR</div>
          </Accordion.Header>
          <Accordion.Body>
            <p className="text-muted mb-3">
              Thiết bị phải cài đặt Ứng dụng ngân hàng (Mobile Banking) hoặc Ví VNPAY
            </p>
            
            <div className="text-center">
              <div style={{ 
                width: 150, 
                height: 150, 
                margin: '0 auto',
                background: '#f8f9fa',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #dee2e6'
              }}>
                <div className="text-muted">VNPAY QR</div>
              </div>
              <p className="text-muted small mt-2">Quét mã bằng ứng dụng ngân hàng</p>
            </div>
            
            <Button variant="outline-primary" className="w-100 pill">
              Quét mã VNPAY
            </Button>
          </Accordion.Body>
        </Accordion.Item>

        {/* Viettel Money */}
        <Accordion.Item eventKey="3" className="soft-card mb-2 border-0">
          <Accordion.Header>
            <div className="fw-bold">Thanh toán qua Viettel Money</div>
          </Accordion.Header>
          <Accordion.Body>
            <p className="text-muted mb-3">
              Bạn cần có tài khoản Viettel Money hoặc có cài đặt ứng dụng Viettel Money
            </p>
            
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ 
                width: 60, 
                height: 60,
                background: '#f0f0f0',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-phone" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div>
                <div className="fw-semibold">Viettel Money</div>
                <div className="text-muted small">Thanh toán nhanh chóng</div>
              </div>
            </div>
            
            <Button variant="outline-primary" className="w-100 pill">
              Thanh toán bằng Viettel Money
            </Button>
          </Accordion.Body>
        </Accordion.Item>

        {/* Cửa hàng tiện lợi */}
        <Accordion.Item eventKey="4" className="soft-card mb-2 border-0">
          <Accordion.Header>
            <div className="fw-bold">Tại cửa hàng tiện lợi hoặc siêu thị</div>
          </Accordion.Header>
          <Accordion.Body>
            <p className="text-muted mb-3">
              Bạn có thể thanh toán tại các cửa hàng tiện lợi, Viettel post hoặc siêu thị
            </p>
            
            <div className="d-flex flex-wrap gap-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <div style={{ 
                  width: 40, 
                  height: 40,
                  background: '#f0f0f0',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-shop"></i>
                </div>
                <div>
                  <div className="fw-semibold small">Circle K</div>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <div style={{ 
                  width: 40, 
                  height: 40,
                  background: '#f0f0f0',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-basket"></i>
                </div>
                <div>
                  <div className="fw-semibold small">FamilyMart</div>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <div style={{ 
                  width: 40, 
                  height: 40,
                  background: '#f0f0f0',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-truck"></i>
                </div>
                <div>
                  <div className="fw-semibold small">Viettel Post</div>
                </div>
              </div>
            </div>
            
            <Button variant="outline-primary" className="w-100 pill">
              Chọn điểm thanh toán
            </Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Tổng tiền */}
      <Card className="soft-card mt-4 p-4 bg-light">
        <div className="text-center">
          <div className="text-muted small">Tổng tiền</div>
          <div className="display-4 fw-bold text-primary-custom">250.000₫</div>
        </div>
      </Card>

      {/* Mã giảm giá */}
      <Row className="g-4 mt-3">
        <Col md={6}>
          <Card className="soft-card p-3">
            <h5 className="mb-2">Mã giảm giá</h5>
            <div className="d-flex align-items-center">
              <Badge bg="success" className="me-3">Giảm 50k</Badge>
              <div>
                <div className="fw-semibold">Đơn hàng tối thiểu 250k</div>
                <div className="text-muted small">Hãy chọn phương thức thanh toán</div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="soft-card p-3">
            <h5 className="mb-2">Chọn hoặc nhập mã</h5>
            <div className="d-flex align-items-center">
              <Badge bg="success" className="me-3">Giảm 50k</Badge>
              <div>
                <div className="fw-semibold">Đơn hàng tối thiểu 250k</div>
                <div className="text-muted small">Hãy chọn phương thức thanh toán</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Thông tin đơn hàng */}
      <Card className="soft-card mt-4 p-4">
        <div className="mb-3">
          <div className="text-muted small">Bạn có thể áp dụng nhiều mã cùng lúc</div>
        </div>
        
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <div className="fw-bold mb-1">Vexere</div>
            <div className="text-muted small">T7, 17/01/2026</div>
            <Button variant="link" className="p-0 text-primary-custom small">Chi tiết</Button>
          </div>
          <Badge bg="light" text="dark" className="border">250.000₫</Badge>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <div className="fw-semibold">Daiichi Travel</div>
            <div className="text-muted small">Sơ đồ 45 (Chuẩn)</div>
          </div>
          <div>1</div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold">Văn phòng 172 Trần Quang Khải</div>
          </div>
          <Button variant="outline-primary" size="sm" className="pill">
            Thay đổi
          </Button>
        </div>
      </Card>

      {/* Nút điều hướng */}
      <div className="d-flex justify-content-between mt-4">
        <Button variant="outline-secondary" className="pill px-4" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Button variant="primary" className="pill px-5">
          Xác nhận thanh toán
        </Button>
      </div>
    </Container>
  );
}