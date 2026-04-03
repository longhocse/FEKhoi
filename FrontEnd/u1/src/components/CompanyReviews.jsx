// src/components/CompanyReviews.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

export default function CompanyReviews({ companyId, companyName }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [canReview, setCanReview] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    useEffect(() => {
        if (companyId) {
            console.log("🔍 CompanyReviews - companyId:", companyId);
            console.log("🔍 CompanyReviews - companyName:", companyName);
            fetchReviews();
            checkCanReview();
        }
    }, [companyId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            console.log("🔄 Đang gọi API:", `${API_URL}/company-reviews/company/${companyId}`);

            const response = await axios.get(`${API_URL}/company-reviews/company/${companyId}`);

            console.log("✅ API response:", response.data);

            if (response.data.success) {
                setReviews(response.data.data || []);
                setStats(response.data.stats);
                console.log("📊 Số đánh giá:", response.data.data?.length);
                console.log("⭐ Rating trung bình:", response.data.stats?.averageRating);
            } else {
                console.error("API trả về lỗi:", response.data.message);
            }
        } catch (err) {
            console.error("❌ Lỗi tải đánh giá:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkCanReview = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await axios.get(`${API_URL}/company-reviews/check-can-review/${companyId}`, {
                headers: getHeaders()
            });
            setCanReview(response.data.canReview || false);
            console.log("🔍 Có thể đánh giá:", response.data.canReview);
        } catch (err) {
            console.error('Lỗi kiểm tra quyền đánh giá:', err);
        }
    };

    const handleSubmitReview = async () => {
        if (userRating === 0) {
            alert('Vui lòng chọn số sao');
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.post(
                `${API_URL}/company-reviews/create`,
                {
                    companyId,
                    rating: userRating,
                    comment: userComment
                },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                alert('Cảm ơn bạn đã đánh giá!');
                setShowReviewModal(false);
                setUserRating(0);
                setUserComment('');
                fetchReviews();
            } else {
                alert(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            console.error("❌ Lỗi gửi đánh giá:", err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const formatRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <span className="text-warning">
                {"★".repeat(fullStars)}
                {hasHalfStar && "½"}
                {"☆".repeat(emptyStars)}
            </span>
        );
    };

    if (loading) {
        return (
            <Card className="shadow-sm mt-4">
                <Card.Body className="text-center">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Đang tải đánh giá...</span>
                </Card.Body>
            </Card>
        );
    }

    // Kiểm tra nếu không có companyId
    if (!companyId) {
        return (
            <Card className="shadow-sm mt-4">
                <Card.Body>
                    <p className="text-muted text-center">Không có thông tin nhà xe</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Card className="shadow-sm mt-4">
                <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h5 className="mb-0">
                            <i className="bi bi-star-fill text-warning me-2"></i>
                            Đánh giá về {companyName || 'nhà xe'}
                        </h5>
                        {stats && stats.totalReviews > 0 && (
                            <div className="mt-2 mt-sm-0">
                                <span className="fw-bold fs-5 me-2">{stats.averageRating.toFixed(1)}/5</span>
                                {formatRating(stats.averageRating)}
                                <span className="text-muted ms-2">({stats.totalReviews} đánh giá)</span>
                            </div>
                        )}
                    </div>
                </Card.Header>
                <Card.Body>
                    {/* Nút đánh giá */}
                    {canReview && (
                        <Button
                            variant="outline-warning"
                            className="mb-3"
                            onClick={() => setShowReviewModal(true)}
                        >
                            <i className="bi bi-star me-2"></i>
                            Đánh giá nhà xe này
                        </Button>
                    )}

                    {/* Danh sách đánh giá */}
                    {reviews.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="bi bi-chat-dots fs-1 text-muted"></i>
                            <p className="text-muted mt-2 mb-0">Chưa có đánh giá nào</p>
                            <small className="text-muted">Hãy là người đầu tiên đánh giá!</small>
                        </div>
                    ) : (
                        reviews.map((review, index) => (
                            <div key={review.id} className={`py-3 ${index !== reviews.length - 1 ? 'border-bottom' : ''}`}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="d-flex gap-2">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: 40, height: 40, fontSize: 16, fontWeight: 'bold' }}>
                                            {review.userName?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <strong>{review.userName}</strong>
                                            <div className="text-warning small">
                                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    <small className="text-muted">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>
                                </div>
                                {review.comment && (
                                    <p className="mt-2 mb-0 text-muted ms-5 ps-2">{review.comment}</p>
                                )}
                            </div>
                        ))
                    )}
                </Card.Body>
            </Card>

            {/* Modal đánh giá */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        Đánh giá {companyName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <div className="d-flex justify-content-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map(star => (
                                <i
                                    key={star}
                                    className={`bi bi-star${star <= userRating ? '-fill' : ''} fs-1 ${star <= userRating ? 'text-warning' : 'text-secondary'}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setUserRating(star)}
                                ></i>
                            ))}
                        </div>
                        <p className="text-muted">
                            {userRating === 1 && 'Rất tệ'}
                            {userRating === 2 && 'Tệ'}
                            {userRating === 3 && 'Bình thường'}
                            {userRating === 4 && 'Tốt'}
                            {userRating === 5 && 'Tuyệt vời!'}
                        </p>
                    </div>
                    <Form.Group>
                        <Form.Label>Nhận xét của bạn</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="warning"
                        onClick={handleSubmitReview}
                        disabled={submitting || userRating === 0}
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}