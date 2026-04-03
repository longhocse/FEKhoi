import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function ReportModal({ show, onHide, ticketId, tripId }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('SERVICE');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    const categories = [
        { value: 'TECHNICAL', label: 'Kỹ thuật', icon: 'bi-gear' },
        { value: 'SERVICE', label: 'Dịch vụ', icon: 'bi-headset' },
        { value: 'PAYMENT', label: 'Thanh toán', icon: 'bi-credit-card' },
        { value: 'OTHER', label: 'Khác', icon: 'bi-chat-dots' }
    ];

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError('Vui lòng nhập tiêu đề');
            return;
        }
        if (!description.trim()) {
            setError('Vui lòng nhập nội dung');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const body = {
                title,
                category,
                description,
                ticketId: ticketId || null,
                tripId: tripId || null
            };

            await axios.post(`${API_URL}/reports/create`, body, {
                headers: getHeaders()
            });

            setSuccess(true);
            setTimeout(() => {
                onHide();
                setSuccess(false);
                setTitle('');
                setDescription('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-flag-fill text-danger me-2"></i>
                    Báo cáo vấn đề
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {success ? (
                    <Alert variant="success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Cảm ơn bạn đã báo cáo! Chúng tôi sẽ xử lý trong thời gian sớm nhất.
                    </Alert>
                ) : (
                    <>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề ngắn gọn..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Loại vấn đề</Form.Label>
                            <div className="d-flex gap-3 flex-wrap">
                                {categories.map(cat => (
                                    <Button
                                        key={cat.value}
                                        variant={category === cat.value ? "primary" : "outline-secondary"}
                                        onClick={() => setCategory(cat.value)}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <i className={`bi ${cat.icon}`}></i>
                                        {cat.label}
                                    </Button>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả chi tiết</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                            />
                        </Form.Group>

                        {(ticketId || tripId) && (
                            <Alert variant="info" className="mt-3">
                                <i className="bi bi-info-circle me-2"></i>
                                {ticketId && `Mã vé liên quan: #${ticketId}`}
                                {tripId && `Mã chuyến: #${tripId}`}
                            </Alert>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading || success}>
                    Hủy
                </Button>
                {!success && (
                    <Button
                        variant="danger"
                        onClick={handleSubmit}
                        disabled={loading || !title.trim() || !description.trim()}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}