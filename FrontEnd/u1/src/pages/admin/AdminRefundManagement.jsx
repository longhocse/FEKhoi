import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';

export default function AdminRefundManagement() {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState('PENDING');

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    useEffect(() => {
        fetchRefunds();
    }, [filter]);

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            setError('');

            console.log("🔄 Đang gọi API với filter:", filter);

            const response = await axios.get(`${API_URL}/refunds/admin/all?status=${filter}`, {
                headers: getHeaders()
            });

            console.log("✅ API Response:", response.data);

            if (response.data.success) {
                setRefunds(response.data.data || []);
            } else {
                setError(response.data.message || "Không thể tải dữ liệu");
            }
        } catch (err) {
            console.error("❌ Lỗi chi tiết:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRefund = (refund) => {
        setSelectedRefund(refund);
        setAdminNote('');
        setShowProcessModal(true);
    };

    const handleApprove = async () => {
        try {
            setProcessing(true);
            const response = await axios.put(
                `${API_URL}/refunds/admin/${selectedRefund.id}/process`,
                { status: 'APPROVED', adminNote },
                { headers: getHeaders() }
            );

            alert('✅ Đã duyệt hoàn tiền thành công');
            setShowProcessModal(false);
            fetchRefunds();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!adminNote.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setProcessing(true);
            const response = await axios.put(
                `${API_URL}/refunds/admin/${selectedRefund.id}/process`,
                { status: 'REJECTED', adminNote },
                { headers: getHeaders() }
            );

            alert('❌ Đã từ chối yêu cầu hoàn tiền');
            setShowProcessModal(false);
            fetchRefunds();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { bg: 'warning', text: 'Chờ duyệt' },
            'APPROVED': { bg: 'success', text: 'Đã duyệt' },
            'REJECTED': { bg: 'danger', text: 'Từ chối' }
        };
        const info = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={info.bg}>{info.text}</Badge>;
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
        <Container className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-arrow-return-left me-2 text-warning"></i>
                Quản lý hoàn tiền
            </h2>

            {error && (
                <Alert variant="danger" className="mb-4">
                    <p>{error}</p>
                    <Button variant="outline-danger" size="sm" onClick={fetchRefunds}>
                        Thử lại
                    </Button>
                </Alert>
            )}

            {/* Filter */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Lọc theo trạng thái</Form.Label>
                                <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                    <option value="ALL">Tất cả</option>
                                    <option value="PENDING">Chờ duyệt</option>
                                    <option value="APPROVED">Đã duyệt</option>
                                    <option value="REJECTED">Từ chối</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <Button variant="primary" onClick={fetchRefunds}>
                                <i className="bi bi-search me-2"></i>
                                Tìm kiếm
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Refunds Table */}
            <Card>
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Người dùng</th>
                                    <th>Vé</th>
                                    <th>Số tiền</th>
                                    <th>Lý do</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {refunds.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            Không có yêu cầu hoàn tiền nào
                                        </td>
                                    </tr>
                                ) : (
                                    refunds.map((refund) => (
                                        <tr key={refund.id}>
                                            <td>#{refund.id}</td>
                                            <td>
                                                <div>{refund.userName}</div>
                                                <small className="text-muted">{refund.userEmail}</small>
                                            </td>
                                            <td>
                                                <div>{refund.fromStation || 'N/A'} → {refund.toStation || 'N/A'}</div>
                                                <small className="text-muted">{formatDate(refund.startTime)}</small>
                                            </td>
                                            <td className="fw-bold text-primary">
                                                {formatCurrency(refund.amount)}
                                                {refund.refundPercentage && (
                                                    <small className="text-muted d-block">
                                                        ({refund.refundPercentage}%)
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                    {refund.reason}
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(refund.status)}</td>
                                            <td>{formatDate(refund.createdAt)}</td>
                                            <td>
                                                {refund.status === 'PENDING' && (
                                                    <Button
                                                        size="sm"
                                                        variant="warning"
                                                        onClick={() => handleProcessRefund(refund)}
                                                    >
                                                        Xử lý
                                                    </Button>
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

            {/* Process Modal */}
            <Modal show={showProcessModal} onHide={() => setShowProcessModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xử lý yêu cầu hoàn tiền</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRefund && (
                        <>
                            <div className="bg-light p-3 rounded mb-3">
                                <p><strong>Người dùng:</strong> {selectedRefund.userName}</p>
                                <p><strong>Email:</strong> {selectedRefund.userEmail}</p>
                                <p><strong>Tuyến xe:</strong> {selectedRefund.fromStation} → {selectedRefund.toStation}</p>
                                <p><strong>Thời gian:</strong> {formatDate(selectedRefund.startTime)}</p>
                                <p><strong>Số tiền yêu cầu:</strong> {formatCurrency(selectedRefund.amount)}</p>
                                <p><strong>Lý do:</strong> {selectedRefund.reason}</p>
                            </div>

                            <Form.Group>
                                <Form.Label>Ghi chú xử lý</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Nhập ghi chú (bắt buộc nếu từ chối)"
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowProcessModal(false)} disabled={processing}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleReject}
                        disabled={processing || !adminNote.trim()}
                    >
                        {processing ? 'Đang xử lý...' : 'Từ chối'}
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleApprove}
                        disabled={processing}
                    >
                        {processing ? 'Đang xử lý...' : 'Duyệt hoàn tiền'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}