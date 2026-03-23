import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function TinTuc() {
    const news = [
        {
            id: 1,
            title: "BUSGO ra mắt tính năng đặt vé qua ví điện tử",
            date: "20/03/2024",
            summary: "Người dùng có thể thanh toán vé xe trực tiếp bằng ví BUSGO, tiện lợi và nhanh chóng...",
            image: "https://picsum.photos/300/200?random=1"
        },
        {
            id: 2,
            title: "Khuyến mãi 20% cho tuyến Hà Nội - Đà Nẵng",
            date: "15/03/2024",
            summary: "Áp dụng cho tất cả vé đặt từ nay đến 30/04/2024. Nhanh tay đặt vé ngay!",
            image: "https://picsum.photos/300/200?random=2"
        },
        {
            id: 3,
            title: "Mở rộng hợp tác với 10 nhà xe mới",
            date: "10/03/2024",
            summary: "BUSGO chính thức hợp tác với các nhà xe uy tín trên toàn quốc, mang đến nhiều lựa chọn hơn...",
            image: "https://picsum.photos/300/200?random=3"
        }
    ];

    return (
        <Container className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-newspaper me-2"></i>
                Tin tức
            </h2>

            <Row>
                {news.map(item => (
                    <Col md={4} key={item.id} className="mb-4">
                        <Card className="shadow-sm h-100">
                            <Card.Img
                                variant="top"
                                src={item.image}
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    {item.date}
                                </Card.Subtitle>
                                <Card.Text>{item.summary}</Card.Text>
                                <Button variant="outline-primary" size="sm">
                                    Đọc tiếp <i className="bi bi-arrow-right ms-1"></i>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}