import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert, Modal } from "react-bootstrap";
import axios from "axios";

export default function AdminReviews() {
    const [tripReviews, setTripReviews] = useState([]);
    const [companyReviews, setCompanyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("trip");
    const [filter, setFilter] = useState("ALL");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    useEffect(() => {
        fetchReviews();
    }, [activeTab]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            let endpoint = activeTab === "trip"
                ? `${API_URL}/reviews/trip/all`
                : `${API_URL}/reviews/company/all`;

            const response = await axios.get(endpoint, { headers: getHeaders() });

            if (response.data.success) {
                if (activeTab === "trip") {
                    setTripReviews(response.data.data);
                } else {
                    setCompanyReviews(response.data.data);
                }
            }
        } catch (err) {
            console.error("Lỗi tải đánh giá:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, type, status) => {
        try {
            const endpoint = type === "trip"
                ? `${API_URL}/reviews/trip/${id}/status`
                : `${API_URL}/reviews/company/${id}/status`;

            await axios.put(endpoint, { status }, { headers: getHeaders() });
            fetchReviews();
        } catch (err) {
            alert("Cập nhật thất bại");
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { bg: "warning", text: "Chờ duyệt" },
            APPROVED: { bg: "success", text: "Đã duyệt" },
            REJECTED: { bg: "danger", text: "Từ chối" }
        };
        const info = statusMap[status] || { bg: "secondary", text: status };
        return <Badge bg={info.bg}>{info.text}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN");
    };

    const formatRating = (rating) => {
        return (
            <div className="text-warning">
                {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                <span className="text-dark ms-1">({rating})</span>
            </div>
        );
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    const currentReviews = activeTab === "trip" ? tripReviews : companyReviews;

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Quản lý đánh giá
            </h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Tab */}
            <div className="d-flex gap-2 mb-4 border-bottom pb-2">
                <Button
                    variant={activeTab === "trip" ? "primary" : "outline-primary"}
                    onClick={() => setActiveTab("trip")}
                >
                    <i className="bi bi-bus-front me-2"></i>
                    Đánh giá chuyến xe
                </Button>
                <Button
                    variant={activeTab === "company" ? "primary" : "outline-primary"}
                    onClick={() => setActiveTab("company")}
                >
                    <i className="bi bi-building me-2"></i>
                    Đánh giá nhà xe
                </Button>
            </div>

            {/* Bộ lọc */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                    <option value="ALL">Tất cả</option>
                                    <option value="PENDING">Chờ duyệt</option>
                                    <option value="APPROVED">Đã duyệt</option>
                                    <option value="REJECTED">Từ chối</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <Button variant="primary" onClick={fetchReviews}>
                                <i className="bi bi-search me-2"></i>
                                Tìm kiếm
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Danh sách đánh giá */}
            <Card>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Người dùng</th>
                                    <th>{activeTab === "trip" ? "Chuyến xe" : "Nhà xe"}</th>
                                    <th>Đánh giá</th>
                                    <th>Nội dung</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                                            Không có đánh giá nào
                                        </td>
                                    </tr>
                                ) : (
                                    currentReviews.filter(r => filter === "ALL" || r.status === filter).map((review) => (
                                        <tr key={review.id}>
                                            <td className="fw-bold">#{review.id}</td>
                                            <td>
                                                <div>{review.userName}</div>
                                                <small className="text-muted">{review.userEmail}</small>
                                            </td>
                                            <td>
                                                {activeTab === "trip"
                                                    ? `${review.fromStation} → ${review.toStation}`
                                                    : review.companyName}
                                            </td>
                                            <td>{formatRating(review.rating)}</td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: "200px" }}>
                                                    {review.comment}
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(review.status)}</td>
                                            <td><small>{formatDate(review.createdAt)}</small></td>
                                            <td>
                                                {review.status === "PENDING" && (
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => updateStatus(review.id, activeTab, "APPROVED")}
                                                            title="Duyệt"
                                                        >
                                                            <i className="bi bi-check-lg"></i>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => updateStatus(review.id, activeTab, "REJECTED")}
                                                            title="Từ chối"
                                                        >
                                                            <i className="bi bi-x-lg"></i>
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}