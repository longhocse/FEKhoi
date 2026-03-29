import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Row, Col, Spinner, Alert, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";

export default function TicketGroup() {
    const { groupId } = useParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("groupId:", groupId);
            const res = await axios.get(
                `http://localhost:5000/api/tickets/group/${groupId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setTickets(res.data.data);
            }
            console.log("API DATA:", res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner />
            </Container>
        );
    }

    if (tickets.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Không tìm thấy vé</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h3 className="mb-4">🎫 Danh sách vé</h3>

            <Row>
                {tickets.map((ticket) => (
                    <Col md={6} key={ticket.id} className="mb-4">
                        <Card className="p-3 shadow">

                            <h5>🎫 Vé #{ticket.id}</h5>

                            <p><strong>Khách hàng:</strong> {ticket.customerName}</p>
                            <p><strong>SĐT:</strong> {ticket.customerPhone}</p>
                            <p><strong>Email:</strong> {ticket.customerEmail}</p>

                            <hr />

                            <p>
                                <strong>Tuyến:</strong> {ticket.fromStation} → {ticket.toStation}
                            </p>

                            <p>
                                <strong>Thời gian xuất phát:</strong>{" "}
                                {new Date(ticket.startTime).toLocaleString()}
                            </p>

                            <p>
                                <strong>Giá vé:</strong> {ticket.totalAmount.toLocaleString()} VND
                            </p>

                            <p><strong>Ghế:</strong> {ticket.seatName}</p>
                            <p><strong>Xe:</strong> {ticket.vehicleName}</p>

                            <Badge bg={
                                ticket.status === "PAID" ? "success" :
                                    ticket.status === "USED" ? "secondary" :
                                        ticket.status === "CANCELLED" ? "danger" :
                                            "warning"
                            }>
                                {ticket.status}
                            </Badge>

                            <div className="text-center mt-3">
                                <p><strong>Mã vé:</strong> {ticket.id}</p>

                                {ticket.qrCode ? (
                                    <img src={ticket.qrCode} alt="QR" style={{ width: 150 }} />
                                ) : (
                                    <Alert variant="warning">Chưa có QR</Alert>
                                )}
                            </div>

                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}