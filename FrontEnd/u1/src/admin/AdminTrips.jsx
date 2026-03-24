// src/admin/AdminTrips.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form, Spinner, Alert, Badge, Row, Col } from "react-bootstrap"; // THÊM Row, Col
import axios from "axios";

export default function AdminTrips() {
    const [trips, setTrips] = useState([]);
    const [stations, setStations] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [formData, setFormData] = useState({
        fromStationId: "",
        toStationId: "",
        vehicleId: "",
        startTime: "",
        price: "",
        estimatedDuration: "",
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
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Gọi từng API riêng lẻ để dễ debug
            const tripsRes = await axios.get(`${API_URL}/admin/trips`, { headers: getHeaders() });
            const stationsRes = await axios.get(`${API_URL}/admin/routes`, { headers: getHeaders() });

            // API vehicles - nếu chưa có, dùng mock data
            let vehiclesData = [];
            try {
                const vehiclesRes = await axios.get(`${API_URL}/vehicles`, { headers: getHeaders() });
                vehiclesData = vehiclesRes.data.data || vehiclesRes.data;
            } catch (vehiclesErr) {
                console.log("API vehicles chưa có, dùng mock data");
                vehiclesData = [
                    { id: 1, name: "Xe giường nằm 40 chỗ", type: "SLEEPER", licensePlate: "29B-12345" },
                    { id: 2, name: "Xe limousine 22 chỗ", type: "LIMOUSINE", licensePlate: "51B-12346" },
                    { id: 3, name: "Xe giường nằm đôi", type: "SLEEPER", licensePlate: "51B-22345" }
                ];
            }

            if (tripsRes.data.success) setTrips(tripsRes.data.data);
            if (stationsRes.data.success) setStations(stationsRes.data.data);
            setVehicles(vehiclesData);

        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setError("Không thể tải dữ liệu. Vui lòng kiểm tra backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (trip = null) => {
        if (trip) {
            setEditingTrip(trip);
            setFormData({
                fromStationId: trip.fromStationId,
                toStationId: trip.toStationId,
                vehicleId: trip.vehicleId,
                startTime: trip.startTime ? trip.startTime.slice(0, 16) : "",
                price: trip.price,
                estimatedDuration: trip.estimatedDuration,
                isActive: trip.isActive ? 1 : 0
            });
        } else {
            setEditingTrip(null);
            setFormData({
                fromStationId: "",
                toStationId: "",
                vehicleId: "",
                startTime: "",
                price: "",
                estimatedDuration: "",
                isActive: 1
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingTrip
                ? `${API_URL}/admin/trips/${editingTrip.id}`
                : `${API_URL}/admin/trips`;
            const method = editingTrip ? "put" : "post";

            await axios[method](url, formData, { headers: getHeaders() });
            alert(editingTrip ? "Cập nhật chuyến xe thành công" : "Thêm chuyến xe thành công");
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa chuyến xe này?")) return;
        try {
            await axios.delete(`${API_URL}/admin/trips/${id}`, { headers: getHeaders() });
            alert("Xóa thành công");
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Xóa thất bại");
        }
    };

    const getStationName = (id) => {
        const station = stations.find(s => s.id === id);
        return station ? station.name : "N/A";
    };

    const getVehicleName = (id) => {
        const vehicle = vehicles.find(v => v.id === id);
        return vehicle ? vehicle.name : "N/A";
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
                    <i className="bi bi-bus-front me-2 text-primary"></i>
                    Quản lý chuyến xe
                </h2>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Thêm chuyến xe
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
                                    <th>Tuyến xe</th>
                                    <th>Thời gian</th>
                                    <th>Giá vé</th>
                                    <th>Xe</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                                            Không có chuyến xe nào
                                        </td>
                                    </tr>
                                ) : (
                                    trips.map((trip) => (
                                        <tr key={trip.id}>
                                            <td className="fw-bold">#{trip.id}</td>
                                            <td>{getStationName(trip.fromStationId)} → {getStationName(trip.toStationId)}</td>
                                            <td>{new Date(trip.startTime).toLocaleString('vi-VN')}</td>
                                            <td className="fw-bold text-primary">{trip.price?.toLocaleString()}đ</td>
                                            <td>{getVehicleName(trip.vehicleId)}</td>
                                            <td>
                                                <Badge bg={trip.isActive ? "success" : "danger"}>
                                                    {trip.isActive ? "Đang hoạt động" : "Đã khóa"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(trip)}>
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(trip.id)}>
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
                    <Modal.Title>{editingTrip ? "Chỉnh sửa chuyến xe" : "Thêm chuyến xe mới"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Điểm đi</Form.Label>
                                    <Form.Select
                                        value={formData.fromStationId}
                                        onChange={(e) => setFormData({ ...formData, fromStationId: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn điểm đi</option>
                                        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Điểm đến</Form.Label>
                                    <Form.Select
                                        value={formData.toStationId}
                                        onChange={(e) => setFormData({ ...formData, toStationId: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn điểm đến</option>
                                        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Xe sử dụng</Form.Label>
                            <Form.Select
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                required
                            >
                                <option value="">Chọn xe</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thời gian khởi hành</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá vé (VNĐ)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thời gian dự kiến (phút)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.estimatedDuration}
                                        onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                                        required
                                        min="1"
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
                                        <option value={0}>Đã khóa</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? "Đang xử lý..." : (editingTrip ? "Cập nhật" : "Thêm mới")}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}