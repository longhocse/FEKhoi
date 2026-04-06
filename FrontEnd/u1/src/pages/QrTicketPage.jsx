import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Card,
    Button,
    Spinner,
    Badge,
    Row,
    Col,
    Modal
} from "react-bootstrap";
import { BsTicketPerforated, BsCheckCircle } from "react-icons/bs";

export default function QrTicketPage() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/tickets/verify/${id}`)
            .then((res) => {
                setTicket(res.data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleCheckIn = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `http://localhost:5000/api/tickets/checkin/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setModalMessage("Check-in thành công!");
            setShowModal(true);
        } catch (err) {
            console.error(err);
            setModalMessage("Check-in thất bại!");
            setShowModal(true);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="text-center mt-5 text-danger">
                Không tìm thấy vé
            </div>
        );
    }

    return (
        <div
            style={{
                backgroundColor: "#FFF8F0",
                minHeight: "100vh",
                padding: "30px"
            }}
        >
            <Container>
                <Card className="shadow-lg border-0">
                    <Card.Header
                        style={{
                            backgroundColor: "#0C4A6E",
                            color: "white",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <BsTicketPerforated /> Ticket Information
                    </Card.Header>

                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <p>
                                    <strong>Mã vé:</strong> {ticket.id}
                                </p>
                                <p>
                                    <strong>Khách hàng:</strong> {ticket.customerName}
                                </p>
                                <p>
                                    <strong>Số điện thoại:</strong> {ticket.phoneNumber}
                                </p>
                                <p>
                                    <strong>Ghế:</strong> {ticket.seatName}
                                </p>
                            </Col>

                            <Col md={6}>
                                <p>
                                    <strong>Tuyến:</strong>
                                    <br />
                                    <span
                                        style={{ color: "#FF8C42", fontWeight: "bold" }}
                                    >
                                        {ticket.fromStation}
                                    </span>
                                    {" → "}
                                    <span
                                        style={{ color: "#0C4A6E", fontWeight: "bold" }}
                                    >
                                        {ticket.toStation}
                                    </span>
                                </p>

                                <p>
                                    <strong>Thời gian:</strong>{" "}
                                    {new Date(ticket.startTime).toLocaleString()}
                                </p>

                                <p>
                                    <strong>Trạng thái:</strong>{" "}
                                    <Badge
                                        bg={
                                            ticket.status === "CONFIRMED" ? "success" : "warning"
                                        }
                                    >
                                        {ticket.status}
                                    </Badge>
                                </p>

                                <p>
                                    <strong>Đặt lúc:</strong>{" "}
                                    {new Date(ticket.bookedAt).toLocaleString()}
                                </p>
                            </Col>
                        </Row>

                        <hr />

                        <div className="text-center">
                            <Button
                                style={{
                                    backgroundColor: "#FF8C42",
                                    border: "none",
                                    padding: "10px 30px",
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    margin: "0 auto"
                                }}
                                onClick={handleCheckIn}
                            >
                                <BsCheckCircle /> Check-in
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thông báo</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
