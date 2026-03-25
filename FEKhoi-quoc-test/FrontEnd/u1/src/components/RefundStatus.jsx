import React from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function RefundStatus({ refund }) {
    const getStatusBadge = () => {
        const statusMap = {
            'PENDING': { bg: 'warning', text: 'Chờ duyệt', icon: 'bi-hourglass-split' },
            'APPROVED': { bg: 'success', text: 'Đã duyệt', icon: 'bi-check-circle' },
            'REJECTED': { bg: 'danger', text: 'Từ chối', icon: 'bi-x-circle' }
        };

        const status = statusMap[refund.status] || { bg: 'secondary', text: refund.status, icon: 'bi-question-circle' };

        return (
            <Badge bg={status.bg} className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                <i className={`bi ${status.icon}`}></i>
                {status.text}
            </Badge>
        );
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

    return (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip>
                    <div className="text-start">
                        <div><strong>Mã yêu cầu:</strong> #{refund.id}</div>
                        <div><strong>Số tiền:</strong> {formatCurrency(refund.amount)}</div>
                        <div><strong>Ngày tạo:</strong> {formatDate(refund.createdAt)}</div>
                        {refund.processedAt && (
                            <div><strong>Ngày xử lý:</strong> {formatDate(refund.processedAt)}</div>
                        )}
                        <div><strong>Lý do:</strong> {refund.reason}</div>
                    </div>
                </Tooltip>
            }
        >
            <div className="d-inline-block">
                {getStatusBadge()}
                {refund.refundPercentage && (
                    <small className="ms-1 text-muted">({refund.refundPercentage}%)</small>
                )}
            </div>
        </OverlayTrigger>
    );
}