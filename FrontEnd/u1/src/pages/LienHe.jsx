import React from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

export default function LienHe() {
    return (
        <Container className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-envelope me-2"></i>
                Liên hệ
            </h2>

            <Row>
                <Col md={6}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h5>Thông tin liên hệ</h5>
                            <hr />
                            <p>
                                <i className="bi bi-geo-alt me-2 text-primary"></i>
                                <strong>Địa chỉ:</strong> 123 Đường Giải Phóng, Hà Nội
                            </p>
                            <p>
                                <i className="bi bi-telephone me-2 text-primary"></i>
                                <strong>Điện thoại:</strong> (024) 1234 5678
                            </p>
                            <p>
                                <i className="bi bi-envelope me-2 text-primary"></i>
                                <strong>Email:</strong> support@busgo.vn
                            </p>
                            <p>
                                <i className="bi bi-clock me-2 text-primary"></i>
                                <strong>Giờ làm việc:</strong> 08:00 - 22:00 (Thứ 2 - Chủ nhật)
                            </p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5>Gửi tin nhắn cho chúng tôi</h5>
                            <hr />
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên</Form.Label>
                                    <Form.Control type="text" placeholder="Nhập họ tên" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" placeholder="Nhập email" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control type="tel" placeholder="Nhập số điện thoại" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nội dung</Form.Label>
                                    <Form.Control as="textarea" rows={4} placeholder="Nhập nội dung..." />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100">
                                    <i className="bi bi-send me-2"></i>
                                    Gửi tin nhắn
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Bản đồ */}
            <Card className="shadow-sm mt-4">
                <Card.Body>
                    <h5>Bản đồ vị trí</h5>
                    <hr />
                    <div
                        style={{
                            height: "300px",
                            background: "#e9ecef",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px"
                        }}
                    >
                        <div className="text-center">
                            <i className="bi bi-map fs-1 text-muted"></i>
                            <p className="text-muted mt-2">Bản đồ Google Maps sẽ hiển thị tại đây</p>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}