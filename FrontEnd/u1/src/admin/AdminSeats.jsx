// src/admin/AdminSeats.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";
import axios from "axios";

export default function AdminSeats() {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [seats, setSeats] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingSeat, setEditingSeat] = useState(null);
    const [formData, setFormData] = useState({ name: "", floor: 1, type: "NORMAL", status: "AVAILABLE" });
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
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError("");

            let vehiclesData = [];
            try {
                const response = await axios.get(`${API_URL}/vehicles`, { headers: getHeaders() });
                if (response.data.success) {
                    vehiclesData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    vehiclesData = response.data;
                } else {
                    vehiclesData = response.data.data || [];
                }
            } catch (apiErr) {
                console.log("API vehicles chưa có, dùng mock data");
                vehiclesData = [
                    { id: 1, name: "Xe giường nằm 40 chỗ", type: "SLEEPER", licensePlate: "29B-12345", numberOfFloors: 1 },
                    { id: 2, name: "Xe limousine 22 chỗ", type: "LIMOUSINE", licensePlate: "51B-12346", numberOfFloors: 1 },
                    { id: 3, name: "Xe giường nằm đôi", type: "SLEEPER", licensePlate: "51B-22345", numberOfFloors: 2 },
                    { id: 4, name: "Xe khách 45 chỗ", type: "STANDARD", licensePlate: "51B-22346", numberOfFloors: 1 },
                    { id: 5, name: "Xe VIP Thành Bưởi", type: "VIP", licensePlate: "51B-32345", numberOfFloors: 1 },
                    { id: 6, name: "Xe giường nằm đôi", type: "COUPLE", licensePlate: "51B-32346", numberOfFloors: 2 },
                    { id: 7, name: "Xe Sao Việt VIP", type: "VIP", licensePlate: "29B-22345", numberOfFloors: 1 },
                    { id: 8, name: "Xe Sao Việt giường nằm", type: "SLEEPER", licensePlate: "29B-22346", numberOfFloors: 2 },
                    { id: 9, name: "Xe Hải Vân", type: "STANDARD", licensePlate: "43B-12345", numberOfFloors: 1 },
                    { id: 10, name: "Xe Hải Vân giường nằm", type: "SLEEPER", licensePlate: "43B-12346", numberOfFloors: 2 }
                ];
            }

            setVehicles(vehiclesData);
            if (vehiclesData.length === 0) {
                setError("Không có xe nào trong hệ thống");
            }

        } catch (err) {
            console.error("Lỗi tải xe:", err);
            setError("Không thể tải danh sách xe");
        } finally {
            setLoading(false);
        }
    };

    const fetchSeats = async (vehicleId) => {
        try {
            setLoading(true);

            let seatsData = [];
            let statsData = null;

            try {
                const seatsRes = await axios.get(`${API_URL}/admin/seats/vehicle/${vehicleId}`, { headers: getHeaders() });
                if (seatsRes.data.success) {
                    seatsData = seatsRes.data.data;
                } else {
                    seatsData = seatsRes.data.data || [];
                }
            } catch (apiErr) {
                console.log("API seats chưa có, tạo mock data từ database");
                // Tạo mock data cho ghế dựa trên loại xe
                const vehicle = vehicles.find(v => v.id === vehicleId);
                const totalSeats = vehicle?.type === "SLEEPER" ? 40 : 45;
                seatsData = [];
                const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
                let seatIndex = 1;
                for (let row of rows) {
                    for (let i = 1; i <= 4; i++) {
                        if (seatIndex <= totalSeats) {
                            seatsData.push({
                                id: seatIndex,
                                name: `${row}${i}`,
                                floor: 1,
                                type: row === "A" ? "VIP" : "NORMAL",
                                status: "AVAILABLE"
                            });
                            seatIndex++;
                        }
                    }
                }
            }

            statsData = {
                totalSeats: seatsData.length,
                availableSeats: seatsData.filter(s => s.status === "AVAILABLE").length,
                bookedSeats: seatsData.filter(s => s.status === "BOOKED").length,
                maintenanceSeats: seatsData.filter(s => s.status === "MAINTENANCE").length,
                vipSeats: seatsData.filter(s => s.type === "VIP").length,
                normalSeats: seatsData.filter(s => s.type === "NORMAL").length
            };

            setSeats(seatsData);
            setStats(statsData);

        } catch (err) {
            console.error("Lỗi tải ghế:", err);
            setError("Không thể tải sơ đồ ghế");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        fetchSeats(vehicle.id);
    };

    const handleUpdateStatus = async (seatId, status) => {
        try {
            setSeats(prev => prev.map(seat =>
                seat.id === seatId ? { ...seat, status } : seat
            ));

            setStats(prev => ({
                ...prev,
                availableSeats: status === "AVAILABLE" ? (prev.availableSeats + 1) : (prev.availableSeats - 1),
                bookedSeats: status === "BOOKED" ? (prev.bookedSeats + 1) : (prev.bookedSeats - 1),
                maintenanceSeats: status === "MAINTENANCE" ? (prev.maintenanceSeats + 1) : (prev.maintenanceSeats - 1)
            }));

            try {
                await axios.put(`${API_URL}/admin/seats/${seatId}/status`, { status }, { headers: getHeaders() });
            } catch (apiErr) {
                console.log("API cập nhật ghế chưa có");
            }

        } catch (err) {
            alert("Cập nhật thất bại");
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            AVAILABLE: { bg: "success", text: "Còn trống" },
            BOOKED: { bg: "danger", text: "Đã đặt" },
            MAINTENANCE: { bg: "warning", text: "Bảo trì" }
        };
        const info = statusMap[status] || { bg: "secondary", text: status };
        return <Badge bg={info.bg}>{info.text}</Badge>;
    };

    const getTypeBadge = (type) => {
        const typeMap = {
            VIP: { bg: "warning", text: "VIP" },
            NORMAL: { bg: "secondary", text: "Thường" },
            COUPLE: { bg: "info", text: "Đôi" }
        };
        const info = typeMap[type] || { bg: "secondary", text: type };
        return <Badge bg={info.bg}>{info.text}</Badge>;
    };

    if (loading && vehicles.length === 0) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">
                <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
                Quản lý ghế
            </h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={3}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-white">
                            <h6 className="mb-0">
                                <i className="bi bi-bus-front me-2"></i>
                                Danh sách xe
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {vehicles.length === 0 ? (
                                    <div className="list-group-item text-center text-muted">
                                        Không có xe nào
                                    </div>
                                ) : (
                                    vehicles.map(vehicle => (
                                        <button
                                            key={vehicle.id}
                                            className={`list-group-item list-group-item-action ${selectedVehicle?.id === vehicle.id ? "active" : ""}`}
                                            onClick={() => handleSelectVehicle(vehicle)}
                                        >
                                            <div className="fw-bold">{vehicle.name}</div>
                                            <small>{vehicle.type} - {vehicle.licensePlate}</small>
                                        </button>
                                    ))
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={9}>
                    {selectedVehicle ? (
                        <>
                            {/* Thông tin xe chi tiết */}
                            <Card className="shadow-sm mb-3">
                                <Card.Header className="bg-white">
                                    <h6 className="mb-0">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Thông tin xe
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3}>
                                            <div className="mb-2">
                                                <small className="text-muted">Biển số</small>
                                                <div className="fw-bold">{selectedVehicle.licensePlate}</div>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="mb-2">
                                                <small className="text-muted">Loại xe</small>
                                                <div className="fw-bold">{selectedVehicle.type}</div>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="mb-2">
                                                <small className="text-muted">Số tầng</small>
                                                <div className="fw-bold">{selectedVehicle.numberOfFloors}</div>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="mb-2">
                                                <small className="text-muted">Nhà xe</small>
                                                <div className="fw-bold">{selectedVehicle.companyName || "Đang cập nhật"}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Thống kê ghế */}
                            {stats && (
                                <Card className="shadow-sm mb-3">
                                    <Card.Header className="bg-white">
                                        <h6 className="mb-0">
                                            <i className="bi bi-bar-chart me-2"></i>
                                            Thống kê ghế
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={3}>
                                                <div className="text-center">
                                                    <div className="h2 text-primary">{stats.totalSeats}</div>
                                                    <small className="text-muted">Tổng số ghế</small>
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <div className="text-center">
                                                    <div className="h2 text-success">{stats.availableSeats}</div>
                                                    <small className="text-muted">Còn trống</small>
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <div className="text-center">
                                                    <div className="h2 text-danger">{stats.bookedSeats}</div>
                                                    <small className="text-muted">Đã đặt</small>
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <div className="text-center">
                                                    <div className="h2 text-warning">{stats.maintenanceSeats}</div>
                                                    <small className="text-muted">Bảo trì</small>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Sơ đồ ghế */}
                            <Card className="shadow-sm">
                                <Card.Header className="bg-white">
                                    <h6 className="mb-0">
                                        <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                                        Sơ đồ ghế
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="text-center mb-3">
                                        <div className="d-flex justify-content-center gap-4">
                                            <Badge bg="success">🟢 Còn trống</Badge>
                                            <Badge bg="danger">🔴 Đã đặt</Badge>
                                            <Badge bg="warning">🟡 Bảo trì</Badge>
                                            <Badge bg="info">⭐ VIP</Badge>
                                        </div>
                                    </div>
                                    <div className="seat-map">
                                        {Array.from({ length: Math.ceil(seats.length / 4) }).map((_, row) => (
                                            <div key={row} className="d-flex justify-content-center gap-2 mb-2">
                                                {seats.slice(row * 4, (row + 1) * 4).map(seat => (
                                                    <Button
                                                        key={seat.id}
                                                        variant={seat.status === "AVAILABLE" ? "outline-success" : seat.status === "BOOKED" ? "danger" : "secondary"}
                                                        size="sm"
                                                        className="seat-button"
                                                        style={{ width: "65px", fontWeight: "bold" }}
                                                        onClick={() => handleUpdateStatus(seat.id, seat.status === "AVAILABLE" ? "BOOKED" : "AVAILABLE")}
                                                    >
                                                        <div>{seat.name}</div>
                                                        {seat.type === "VIP" && <small className="text-warning">⭐</small>}
                                                    </Button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-3">
                                        <small className="text-muted">
                                            💡 Click vào ghế để thay đổi trạng thái
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </>
                    ) : (
                        <Card className="shadow-sm text-center py-5">
                            <Card.Body>
                                <i className="bi bi-grid-3x3-gap-fill fs-1 text-muted"></i>
                                <p className="mt-3 mb-0">Chọn một xe từ danh sách bên trái để xem sơ đồ ghế</p>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
}