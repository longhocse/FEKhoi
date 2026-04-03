// src/pages/admin/AdminReports.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert, Modal } from "react-bootstrap";
import axios from "axios";

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState({ status: "ALL", category: "ALL" });
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminNote, setAdminNote] = useState("");
    const [processing, setProcessing] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log("🔄 Đang gọi API reports...");

            const params = new URLSearchParams();
            if (filter.status !== "ALL") params.append("status", filter.status);
            if (filter.category !== "ALL") params.append("category", filter.category);

            const response = await axios.get(`${API_URL}/reports/admin/all?${params.toString()}`, {
                headers: getHeaders()
            });

            console.log("✅ Reports response:", response.data);

            if (response.data.success) {
                setReports(response.data.data || []);
                console.log(`📊 Có ${response.data.data?.length || 0} báo cáo`);
            } else {
                setError(response.data.message || "Không thể tải báo cáo");
            }

            // Lấy thống kê
            try {
                const statsRes = await axios.get(`${API_URL}/reports/admin/stats`, {
                    headers: getHeaders()
                });
                console.log("✅ Stats response:", statsRes.data);
                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
            } catch (statsErr) {
                console.error("Lỗi lấy thống kê:", statsErr);
            }

        } catch (err) {
            console.error("❌ Lỗi chi tiết:", err);
            console.error("Response:", err.response?.data);
            setError(err.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            setProcessing(true);
            const response = await axios.put(
                `${API_URL}/reports/admin/${reportId}/status`,
                { status: newStatus, adminNote },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                alert("Cập nhật trạng thái thành công");
                setShowModal(false);
                setAdminNote("");
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setProcessing(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            TECHNICAL: "🔧",
            SERVICE: "🎧",
            PAYMENT: "💳",
            OTHER: "📝"
        };
        return icons[category] || "📌";
    };

    const getCategoryText = (category) => {
        const texts = {
            TECHNICAL: "Kỹ thuật",
            SERVICE: "Dịch vụ",
            PAYMENT: "Thanh toán",
            OTHER: "Khác"
        };
        return texts[category] || category;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { bg: "warning", text: "Chờ xử lý" },
            PROCESSING: { bg: "info", text: "Đang xử lý" },
            RESOLVED: { bg: "success", text: "Đã giải quyết" },
            CLOSED: { bg: "secondary", text: "Đã đóng" }
        };
        const info = statusMap[status] || { bg: "light", text: status };
        return <Badge bg={info.bg}>{info.text}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN");
    };

    if (loading) {
        return (
            <Container fluid className="py-4 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="py-4">
                <Alert variant="danger">
                    <Alert.Heading>Lỗi!</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <Button variant="outline-danger" onClick={fetchData}>
                        Thử lại
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-flag-fill text-danger me-2"></i>
                Quản lý báo cáo & phản hồi
            </h2>

            {/* Thống kê */}
            {stats && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="bg-primary text-white">
                            <Card.Body>
                                <h6>Tổng báo cáo</h6>
                                <h3>{stats.totalReports || 0}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="bg-warning">
                            <Card.Body>
                                <h6>Chờ xử lý</h6>
                                <h3>{stats.pendingReports || 0}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="bg-info text-white">
                            <Card.Body>
                                <h6>Đang xử lý</h6>
                                <h3>{stats.processingReports || 0}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="bg-success text-white">
                            <Card.Body>
                                <h6>Đã giải quyết</h6>
                                <h3>{stats.resolvedReports || 0}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Bộ lọc */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                                    <option value="ALL">Tất cả</option>
                                    <option value="PENDING">Chờ xử lý</option>
                                    <option value="PROCESSING">Đang xử lý</option>
                                    <option value="RESOLVED">Đã giải quyết</option>
                                    <option value="CLOSED">Đã đóng</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Loại vấn đề</Form.Label>
                                <Form.Select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                                    <option value="ALL">Tất cả</option>
                                    <option value="TECHNICAL">Kỹ thuật</option>
                                    <option value="SERVICE">Dịch vụ</option>
                                    <option value="PAYMENT">Thanh toán</option>
                                    <option value="OTHER">Khác</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <Button variant="primary" onClick={fetchData}>
                                <i className="bi bi-search me-2"></i>
                                Tìm kiếm
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Danh sách báo cáo */}
            <Card>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Người dùng</th>
                                    <th>Tiêu đề</th>
                                    <th>Loại</th>
                                    <th>Nội dung</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                                            Không có báo cáo nào
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report.id}>
                                            <td className="fw-bold">#{report.id}</td>
                                            <td>
                                                <div>{report.userName || "Ẩn danh"}</div>
                                                <small className="text-muted">{report.userEmail}</small>
                                            </td>
                                            <td>{report.title}</td>
                                            <td>
                                                <Badge bg="secondary">
                                                    {getCategoryIcon(report.category)} {getCategoryText(report.category)}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: "250px" }}>
                                                    {report.description}
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(report.status)}</td>
                                            <td>
                                                <small>{formatDate(report.createdAt)}</small>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Xử lý
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal xử lý báo cáo */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-flag-fill text-danger me-2"></i>
                        Xử lý báo cáo #{selectedReport?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReport && (
                        <>
                            <div className="bg-light p-3 rounded mb-3">
                                <Row>
                                    <Col md={6}>
                                        <small className="text-muted d-block">Người gửi</small>
                                        <strong>{selectedReport.userName || "Ẩn danh"}</strong>
                                        <div className="text-muted small">{selectedReport.userEmail}</div>
                                    </Col>
                                    <Col md={6}>
                                        <small className="text-muted d-block">Ngày gửi</small>
                                        <strong>{formatDate(selectedReport.createdAt)}</strong>
                                    </Col>
                                </Row>
                            </div>

                            <div className="bg-white border rounded p-3 mb-3">
                                <h6 className="mb-2">Tiêu đề</h6>
                                <p>{selectedReport.title}</p>
                                <h6 className="mb-2">Loại vấn đề</h6>
                                <p>
                                    <Badge bg="secondary">
                                        {getCategoryIcon(selectedReport.category)} {getCategoryText(selectedReport.category)}
                                    </Badge>
                                </p>
                                <h6 className="mb-2">Nội dung</h6>
                                <p className="text-muted">{selectedReport.description}</p>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Ghi chú xử lý</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Nhập ghi chú xử lý..."
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Cập nhật trạng thái</Form.Label>
                                <div className="d-flex gap-2 mt-2">
                                    {selectedReport.status !== "PROCESSING" && (
                                        <Button variant="info" onClick={() => handleUpdateStatus(selectedReport.id, "PROCESSING")} disabled={processing}>
                                            <i className="bi bi-arrow-repeat me-1"></i> Đang xử lý
                                        </Button>
                                    )}
                                    {selectedReport.status !== "RESOLVED" && (
                                        <Button variant="success" onClick={() => handleUpdateStatus(selectedReport.id, "RESOLVED")} disabled={processing}>
                                            <i className="bi bi-check-circle me-1"></i> Đã giải quyết
                                        </Button>
                                    )}
                                    {selectedReport.status !== "CLOSED" && (
                                        <Button variant="secondary" onClick={() => handleUpdateStatus(selectedReport.id, "CLOSED")} disabled={processing}>
                                            <i className="bi bi-x-circle me-1"></i> Đóng
                                        </Button>
                                    )}
                                </div>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={processing}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}