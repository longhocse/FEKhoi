import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    Container, Row, Col, Card, Table,
    Modal, Button, Badge
} from "react-bootstrap";
import { FaChair, FaBus, FaUser, FaLock, FaUnlock } from "react-icons/fa";

export default function TripSeats() {
    const { tripId } = useParams();
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tripDetail, setTripDetail] = useState(null);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchSeats();
        fetchTripDetail();
        fetchBookings();
    }, []);

    const fetchSeats = async () => {
        const res = await axios.get(`http://localhost:5000/api/partner/trips/${tripId}/seats`);
        setSeats(res.data);
    };

    const fetchTripDetail = async () => {
        const res = await axios.get(`http://localhost:5000/api/trips/${tripId}`);
        setTripDetail(res.data.data);
    };

    const fetchBookings = async () => {
        const res = await axios.get(`http://localhost:5000/api/partner/trips/${tripId}/bookings`);
        setBookings(res.data.data || []);
    };

    const handleClick = (seat) => {
        setSelectedSeat(seat);
        setShowModal(true);
    };

    const handleConfirm = async () => {
        if (selectedSeat.status === "AVAILABLE") {
            await axios.put(`http://localhost:5000/api/partner/seats/${selectedSeat.id}/lock`);
        } else if (selectedSeat.status === "MAINTENANCE") {
            await axios.put(`http://localhost:5000/api/partner/seats/${selectedSeat.id}/unlock`);
        }
        setShowModal(false);
        fetchSeats();
    };

    const getSeatStyle = (status) => {
        if (status === "AVAILABLE") return { background: "#FF8C42", color: "#fff" };
        if (status === "BOOKED") return { background: "#0C4A6E", color: "#fff" };
        return { background: "#6c757d", color: "#fff" };
    };

    return (
        <Container fluid style={{ background: "#FFF8F0", minHeight: "100vh", padding: "20px" }}>

            {/* HEADER */}
            <h3 style={{ color: "#0C4A6E", fontWeight: "bold" }}>
                <FaChair /> Quản lý ghế chuyến xe
            </h3>

            {/* TRIP INFO */}
            {tripDetail && (
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <h5 style={{ color: "#FF8C42" }}>
                            <FaBus /> Thông tin chuyến
                        </h5>
                        <Row>
                            <Col md={6}>
                                <p><b>Tuyến:</b> {tripDetail.fromStation} → {tripDetail.toStation}</p>
                                <p><b>Xe:</b> {tripDetail.vehicleName}</p>
                            </Col>
                            <Col md={6}>
                                <p><b>Giờ:</b> {new Date(tripDetail.startTime).toLocaleString()}</p>
                                <p><b>Giá:</b> {tripDetail.price.toLocaleString()} đ</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* SEAT GRID */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h5 style={{ color: "#0C4A6E" }}>
                        <FaChair /> Sơ đồ ghế
                    </h5>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(8, 1fr)",
                        gap: "10px"
                    }}>
                        {seats.map(seat => (
                            <div
                                key={seat.id}
                                onClick={() => handleClick(seat)}
                                style={{
                                    ...getSeatStyle(seat.status),
                                    padding: "10px",
                                    textAlign: "center",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                {seat.name}
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* BOOKINGS */}
            <Card className="shadow-sm">
                <Card.Body>
                    <h5 style={{ color: "#FF8C42" }}>
                        <FaUser /> Danh sách khách
                    </h5>

                    <Table bordered hover>
                        <thead style={{ background: "#0C4A6E", color: "#fff" }}>
                            <tr>
                                <th>Ghế</th>
                                <th>Tên</th>
                                <th>SĐT</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((b, i) => (
                                    <tr key={i}>
                                        <td>{b.seatName}</td>
                                        <td>{b.customerName}</td>
                                        <td>{b.phone}</td>
                                        <td>
                                            <Badge bg={b.status === "PAID" ? "success" : "secondary"}>
                                                {b.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedSeat?.status === "BOOKED" ? (
                        <>
                            <p><b>Ghế:</b> {selectedSeat.name}</p>
                            {bookings
                                .filter(b => b.seatId === selectedSeat.id)
                                .map((b, i) => (
                                    <div key={i}>
                                        <p><b>Tên:</b> {b.customerName}</p>
                                        <p><b>SĐT:</b> {b.phone}</p>
                                    </div>
                                ))}
                        </>
                    ) : selectedSeat?.status === "AVAILABLE" ? (
                        <p><FaLock /> Khóa ghế {selectedSeat?.name}?</p>
                    ) : (
                        <p><FaUnlock /> Mở khóa ghế {selectedSeat?.name}?</p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button style={{ background: "#FF8C42", border: "none" }} onClick={handleConfirm}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}