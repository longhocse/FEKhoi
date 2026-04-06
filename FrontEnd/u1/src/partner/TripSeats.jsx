import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();

    useEffect(() => {
        fetchSeats();
        fetchTripDetail();
        fetchBookings();
    }, []);

    const fetchSeats = async () => {
        const res = await axios.get(`http://localhost:5000/api/trips/${tripId}`);

        // lấy đúng từ backend bạn gửi
        setSeats(res.data.data?.seats || []);
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

    const handleCheckIn = (ticketId) => {
        navigate(`/ticket/qrTicketPage/${ticketId}`);
    };

    const getSeatStyle = (seat) => {
        const booking = bookingMap[seat.id];

        if (booking) {
            if (booking.status === "PAID") {
                return {
                    background: "#0C4A6E",
                    color: "#fff"
                };
            }

            if (booking.status === "USED") {
                return {
                    background: "#374151", // xám đậm
                    color: "#fff",
                    opacity: 0.85
                };
            }
        }

        // fallback theo seat.status
        switch (seat.status) {
            case "AVAILABLE":
                return { background: "#FF8C42", color: "#fff" };

            case "MAINTENANCE":
                return {
                    background: "#9CA3AF",
                    color: "#fff",
                    border: "2px dashed #555"
                };

            default:
                return { background: "#6c757d", color: "#fff" };
        }
    };

    const bookingMap = {};

    bookings.forEach(b => {
        bookingMap[b.seatId] = b;
    });

    const getSeatName = (seat) => {
        if (!seat) return "";
        return seat.seatName || "";
    };
    // GROUP THEO ROW
    const seatRows = {};

    seats.forEach((seat) => {
        if (!seat) return;

        const seatName = getSeatName(seat);
        if (!seatName) return;

        const row = seatName[0];

        if (!seatRows[row]) seatRows[row] = [];
        seatRows[row].push(seat);
    });

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
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginBottom: "15px",
                        flexWrap: "wrap"
                    }}>
                        {/* AVAILABLE */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                                width: "18px",
                                height: "18px",
                                background: "#FF8C42",
                                borderRadius: "4px"
                            }} />
                            <span style={{ fontSize: "13px" }}>Còn trống</span>
                        </div>

                        {/* PAID / BOOKED */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                                width: "18px",
                                height: "18px",
                                background: "#0C4A6E",
                                borderRadius: "4px"
                            }} />
                            <span style={{ fontSize: "13px" }}>Đã đặt</span>
                        </div>

                        {/* USED */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                                width: "18px",
                                height: "18px",
                                background: "#374151",
                                borderRadius: "4px"
                            }} />
                            <span style={{ fontSize: "13px" }}>Đã sử dụng</span>
                        </div>

                        {/* MAINTENANCE */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                                width: "18px",
                                height: "18px",
                                background: "#9CA3AF",
                                borderRadius: "4px",
                                border: "2px dashed #555"
                            }} />
                            <span style={{ fontSize: "13px" }}>Bảo trì</span>
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "10px"
                    }}>
                        {Object.keys(seatRows).sort().map((rowKey) => {

                            const rowSeats = seatRows[rowKey].sort((a, b) =>
                                getSeatName(a).localeCompare(getSeatName(b))
                            );

                            return (
                                <div
                                    key={rowKey}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "50px"
                                    }}
                                >
                                    {/* LEFT SIDE */}
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        {rowSeats.slice(0, 2).map((seat) => {
                                            const seatName = getSeatName(seat);

                                            return (
                                                <div
                                                    key={seat.id}
                                                    onClick={() => handleClick(seat)}
                                                    style={{
                                                        width: "55px",
                                                        height: "55px",
                                                        borderRadius: "12px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: "600",
                                                        fontSize: "14px",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                                        ...getSeatStyle(seat)
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "scale(1.1)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }}
                                                >
                                                    {seatName}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* AISLE (lối đi) */}
                                    <div style={{
                                        width: "40px",
                                        textAlign: "center",
                                        color: "#999",
                                        fontSize: "12px"
                                    }}>
                                        |
                                    </div>

                                    {/* RIGHT SIDE */}
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        {rowSeats.slice(2, 4).map((seat) => {
                                            const seatName = getSeatName(seat);

                                            return (
                                                <div
                                                    key={seat.id}
                                                    onClick={() => handleClick(seat)}
                                                    style={{
                                                        width: "55px",
                                                        height: "55px",
                                                        borderRadius: "12px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: "600",
                                                        fontSize: "14px",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                                        ...getSeatStyle(seat)
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "scale(1.1)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }}
                                                >
                                                    {seatName}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
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
                                <th>Check-in</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted">
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

                                        {/* ✅ CHECK-IN BUTTON */}
                                        <td>
                                            {b.status === "PAID" ? (
                                                <Button
                                                    size="sm"
                                                    style={{
                                                        background: "#0C4A6E",
                                                        border: "none"
                                                    }}
                                                    onClick={() => handleCheckIn(b.ticketId)}
                                                >
                                                    Check-in
                                                </Button>
                                            ) : b.status === "USED" ? (
                                                <Badge bg="dark">Đã check-in</Badge>
                                            ) : (
                                                "-"
                                            )}
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
                    {(() => {
                        const booking = bookings.find(b => b.seatId === selectedSeat?.id);

                        if (booking) {
                            return (
                                <>
                                    <p><b>Ghế:</b> {getSeatName(selectedSeat)}</p>
                                    <p><b>Tên:</b> {booking.customerName}</p>
                                    <p><b>SĐT:</b> {booking.phone}</p>
                                    <p>
                                        <b>Trạng thái:</b>{" "}
                                        <Badge bg={booking.status === "PAID" ? "success" : "secondary"}>
                                            {booking.status}
                                        </Badge>
                                    </p>
                                </>
                            );
                        }

                        if (selectedSeat?.status === "AVAILABLE") {
                            return <p><FaLock /> Khóa ghế {getSeatName(selectedSeat)}?</p>;
                        }

                        if (selectedSeat?.status === "MAINTENANCE") {
                            return <p><FaUnlock /> Mở khóa ghế {getSeatName(selectedSeat)}?</p>;
                        }

                        return <p>Không thể thao tác ghế này</p>;
                    })()}
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