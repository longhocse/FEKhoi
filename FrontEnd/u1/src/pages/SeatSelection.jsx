import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import SeatLayout from "../components/SeatLayout";

export default function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();

  const trip = location.state?.trip;
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!trip) {
    return (
      <Container className="py-5 text-center">
        <h4>Không có dữ liệu chuyến xe</h4>
        <Button onClick={() => navigate("/tuyen-xe")}>
          Quay lại
        </Button>
      </Container>
    );
  }

  const handleContinue = () => {
    if (!selectedSeat) {
      alert("Vui lòng chọn ghế");
      return;
    }

    navigate("/thanh-toan", {
      state: {
        trip,
        seat: selectedSeat
      }
    });
  };

  return (
    <Container className="py-4">
      <h3 className="mb-4">Chọn ghế</h3>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>

              <div className="mb-3">
                <Badge bg="success" className="me-2">Còn trống</Badge>
                <Badge bg="danger" className="me-2">Đã đặt</Badge>
                <Badge bg="secondary">Bảo trì</Badge>
              </div>

              <SeatLayout
                seats={trip.seats}
                selectedSeat={selectedSeat}
                setSelectedSeat={setSelectedSeat}
              />

            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>

              <h5>Thông tin vé</h5>

              <p>
                <b>Tuyến:</b><br />
                {trip.fromStation} → {trip.toStation}
              </p>

              <p>
                <b>Giá:</b><br />
                {trip.price.toLocaleString()}đ
              </p>

              <p>
                <b>Ghế:</b><br />
                {selectedSeat
                  ? trip.seats.find(s => s.id === selectedSeat)?.seatName
                  : "Chưa chọn"}
              </p>

              <Button
                className="w-100"
                size="lg"
                disabled={!selectedSeat}
                onClick={handleContinue}
              >
                Tiếp tục thanh toán
              </Button>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}