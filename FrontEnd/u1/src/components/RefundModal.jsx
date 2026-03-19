import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

export default function RefundModal({ show, onHide, ticket, onSubmit, loading }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [refundInfo, setRefundInfo] = useState(null);

    // Tính toán thông tin hoàn tiền khi mở modal
    React.useEffect(() => {
        if (ticket && show) {
            calculateRefund();
        }
    }, [ticket, show]);

    const calculateRefund = () => {
        if (!ticket) return;

        const departureTime = new Date(ticket.startTime);
        const now = new Date();
        const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

        let refundAmount = 0;
        let refundPercentage = 0;
        let message = '';

        if (hoursUntilDeparture > 48) {
            refundAmount = ticket.totalAmount;
            refundPercentage = 100;
            message = '✅ Hoàn 100% số tiền vé (hủy trước 48 giờ)';
        } else if (hoursUntilDeparture > 0) {
            refundAmount = ticket.totalAmount * 0.5;
            refundPercentage = 50;
            message = '⚠️ Hoàn 50% số tiền vé (hủy sau 48 giờ)';
        } else {
            refundAmount = 0;
            refundPercentage = 0;
            message = '❌ Không được hoàn tiền (đã quá giờ khởi hành)';
        }

        setRefundInfo({
            originalAmount: ticket.totalAmount,
            refundAmount,
            refundPercentage,
            hoursUntilDeparture: Math.round(hoursUntilDeparture * 10) / 10,
            message,
            canRefund: refundAmount > 0
        });
    };

    const handleSubmit = async () => {
        if (!refundInfo?.canRefund) {
            setError('Không thể hoàn tiền cho vé này');
            return;
        }

        if (!reason.trim()) {
            setError('Vui lòng nhập lý do hoàn tiền');
            return;
        }

        setError('');
        await onSubmit(ticket.id, reason);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-arrow-return-left me-2 text-warning"></i>
                    Yêu cầu hoàn tiền
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {ticket && refundInfo && (
                    <>
                        {/* Thông tin vé */}
                        <div className="bg-light p-3 rounded mb-3">
                            <h6 className="mb-3">Thông tin vé</h6>
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">Tuyến xe</small>
                                    <strong>{ticket.fromStation} → {ticket.toStation}</strong>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">Thời gian khởi hành</small>
                                    <strong>{formatDateTime(ticket.startTime)}</strong>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">Ghế</small>
                                    <strong>{ticket.seatName}</strong>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">Giá vé</small>
                                    <strong>{formatCurrency(ticket.totalAmount)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin hoàn tiền */}
                        <div className={`p-3 rounded mb-3 ${refundInfo.refundPercentage === 100 ? 'bg-success bg-opacity-10' :
                                refundInfo.refundPercentage === 50 ? 'bg-warning bg-opacity-10' :
                                    'bg-danger bg-opacity-10'
                            }`}>
                            <h6 className="mb-3">Thông tin hoàn tiền</h6>

                            <div className="mb-2">
                                <div className="d-flex justify-content-between">
                                    <span>Thời gian còn lại:</span>
                                    <strong>{refundInfo.hoursUntilDeparture} giờ</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Tỷ lệ hoàn:</span>
                                    <strong className={
                                        refundInfo.refundPercentage === 100 ? 'text-success' :
                                            refundInfo.refundPercentage === 50 ? 'text-warning' :
                                                'text-danger'
                                    }>
                                        {refundInfo.refundPercentage}%
                                    </strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Số tiền được hoàn:</span>
                                    <strong className="text-primary">{formatCurrency(refundInfo.refundAmount)}</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Mất phí:</span>
                                    <strong className="text-danger">{formatCurrency(ticket.totalAmount - refundInfo.refundAmount)}</strong>
                                </div>
                            </div>

                            <Alert variant={
                                refundInfo.refundPercentage === 100 ? 'success' :
                                    refundInfo.refundPercentage === 50 ? 'warning' :
                                        'danger'
                            } className="mt-2 mb-0 small">
                                <i className={`bi ${refundInfo.refundPercentage === 100 ? 'bi-check-circle' :
                                        refundInfo.refundPercentage === 50 ? 'bi-exclamation-triangle' :
                                            'bi-x-circle'
                                    } me-2`}></i>
                                {refundInfo.message}
                            </Alert>
                        </div>

                        {/* Form lý do */}
                        {refundInfo.canRefund ? (
                            <Form.Group>
                                <Form.Label>Lý do hoàn tiền <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Nhập lý do hoàn tiền (ví dụ: thay đổi kế hoạch, bận việc đột xuất, ...)"
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    Lý do sẽ được xem xét bởi admin trước khi duyệt
                                </Form.Text>
                            </Form.Group>
                        ) : (
                            <Alert variant="danger">
                                <i className="bi bi-x-circle-fill me-2"></i>
                                Vé này không thể hoàn tiền do đã quá giờ khởi hành
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="danger" className="mt-3">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </Alert>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    variant="warning"
                    onClick={handleSubmit}
                    disabled={loading || !refundInfo?.canRefund || !reason.trim()}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        'Gửi yêu cầu hoàn tiền'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}