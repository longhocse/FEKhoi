import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    OverlayTrigger,
    Tooltip,
    Modal,
    Button
} from "react-bootstrap";
import "../styles/TripSeats.css";

export default function TripSeats() {
    const { tripId } = useParams();
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSeats();
    }, []);

    const fetchSeats = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/partner/trips/${tripId}/seats`
            );
            setSeats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // 👉 click seat
    const handleClick = (seat) => {
        if (seat.status === "BOOKED") return;

        setSelectedSeat(seat);
        setShowModal(true);
    };

    // 👉 confirm action
    const handleConfirm = async () => {
        try {
            if (selectedSeat.status === "AVAILABLE") {
                await axios.put(
                    `http://localhost:5000/api/partner/seats/${selectedSeat.id}/lock`
                );
            } else if (selectedSeat.status === "MAINTENANCE") {
                await axios.put(
                    `http://localhost:5000/api/partner/seats/${selectedSeat.id}/unlock`
                );
            }

            setShowModal(false);
            fetchSeats();
        } catch (err) {
            console.error(err);
        }
    };

    const getClass = (status) => {
        if (status === "AVAILABLE") return "seat available";
        if (status === "BOOKED") return "seat booked";
        if (status === "MAINTENANCE") return "seat locked";
    };

    const renderTooltip = (seat) => (
        <Tooltip>
            Ghế: {seat.name} <br />
            Trạng thái: {seat.status}
        </Tooltip>
    );

    return (
        <div className="seat-container">
            <h3 className="title">🎫 Quản lý ghế chuyến xe</h3>

            {/* Legend */}
            <div className="legend">
                <div><span className="box available"></span> Trống</div>
                <div><span className="box locked"></span> Đã khóa</div>
                <div><span className="box booked"></span> Đã đặt</div>
            </div>

            {/* Grid */}
            <div className="seat-grid">
                {seats.map((seat) => (
                    <OverlayTrigger
                        key={seat.id}
                        placement="top"
                        overlay={renderTooltip(seat)}
                    >
                        <div
                            className={getClass(seat.status)}
                            onClick={() => handleClick(seat)}
                        >
                            {seat.name}
                        </div>
                    </OverlayTrigger>
                ))}
            </div>

            {/* Modal Confirm */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedSeat?.status === "AVAILABLE"
                        ? `Bạn muốn KHÓA ghế ${selectedSeat?.name}?`
                        : `Bạn muốn MỞ KHÓA ghế ${selectedSeat?.name}?`}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}