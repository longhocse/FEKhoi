// src/admin/AdminPromotions.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form, Spinner, Alert, Badge, Row, Col } from "react-bootstrap"; // THÊM Row, Col
import axios from "axios";

export default function AdminPromotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        discountType: "PERCENT",
        discountValue: "",
        minOrderValue: 0,
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: 1,
        isActive: 1
    });
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/promotions`, { headers: getHeaders() });
            if (response.data.success) {
                setPromotions(response.data.data);
            }
        } catch (err) {
            console.error("Lỗi tải khuyến mãi:", err);
            setError("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (promo = null) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                code: promo.code,
                name: promo.name,
                description: promo.description || "",
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                minOrderValue: promo.minOrderValue,
                maxDiscount: promo.maxDiscount || "",
                startDate: promo.startDate.slice(0, 16),
                endDate: promo.endDate.slice(0, 16),
                usageLimit: promo.usageLimit,
                isActive: promo.isActive ? 1 : 0
            });
        } else {
            setEditingPromo(null);
            setFormData({
                code: "",
                name: "",
                description: "",
                discountType: "PERCENT",
                discountValue: "",
                minOrderValue: 0,
                maxDiscount: "",
                startDate: "",
                endDate: "",
                usageLimit: 1,
                isActive: 1
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingPromo) {
                await axios.put(`${API_URL}/admin/promotions/${editingPromo.id}`, formData, { headers: getHeaders() });
                alert("Cập nhật khuyến mãi thành công");
            } else {
                await axios.post(`${API_URL}/admin/promotions`, formData, { headers: getHeaders() });
                alert("Thêm khuyến mãi thành công");
            }
            setShowModal(false);
            fetchPromotions();
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;
        try {
            await axios.delete(`${API_URL}/admin/promotions/${id}`, { headers: getHeaders() });
            alert("Xóa thành công");
            fetchPromotions();
        } catch (err) {
            alert(err.response?.data?.message || "Xóa thất bại");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <i className="bi bi-tag-fill me-2 text-primary"></i>
                    Quản lý khuyến mãi
                </h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Thêm khuyến mãi
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Mã</th>
                                    <th>Tên</th>
                                    <th>Giảm giá</th>
                                    <th>Đơn tối thiểu</th>
                                    <th>Hiệu lực</th>
                                    <th>Đã dùng</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                                            Không có khuyến mãi nào
                                        </td>
                                    </tr>
                                ) : (
                                    promotions.map((promo) => (
                                        <tr key={promo.id}>
                                            <td className="fw-bold">#{promo.id}</td>
                                            <td><Badge bg="info">{promo.code}</Badge></td>
                                            <td>{promo.name}</td>
                                            <td className="fw-bold text-success">
                                                {promo.discountType === "PERCENT" ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}đ`}
                                                {promo.maxDiscount && promo.discountType === "PERCENT" && ` (tối đa ${promo.maxDiscount.toLocaleString()}đ)`}
                                            </td>
                                            <td>{promo.minOrderValue?.toLocaleString()}đ</td>
                                            <td>
                                                <small>
                                                    {formatDate(promo.startDate)}<br />→ {formatDate(promo.endDate)}
                                                </small>
                                            </td>
                                            <td>{promo.usedCount}/{promo.usageLimit === 0 ? "∞" : promo.usageLimit}</td>
                                            <td>
                                                <Badge bg={promo.isActive && new Date(promo.endDate) > new Date() ? "success" : "secondary"}>
                                                    {promo.isActive && new Date(promo.endDate) > new Date() ? "Đang hoạt động" : "Đã hết hạn"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(promo)}>
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(promo.id)}>
                                                    <i className="bi bi-trash"></i>
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

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingPromo ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã khuyến mãi</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                        placeholder="VD: BUSGO20"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên khuyến mãi</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Loại giảm giá</Form.Label>
                                    <Form.Select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="PERCENT">Phần trăm (%)</option>
                                        <option value="FIXED">Số tiền cố định</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá trị giảm</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Đơn hàng tối thiểu (VNĐ)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giảm tối đa (VNĐ) - Chỉ áp dụng cho %</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                        min="0"
                                        placeholder="Không giới hạn"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày bắt đầu</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày kết thúc</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lần sử dụng (0 = không giới hạn)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Trạng thái</Form.Label>
                                    <Form.Select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>Đang hoạt động</option>
                                        <option value={0}>Tạm dừng</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? "Đang xử lý..." : (editingPromo ? "Cập nhật" : "Thêm mới")}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}