import { Row, Col, Button } from "react-bootstrap";

export default function SeatLayout({ seats = [], selectedSeats = [], onSeatSelect }) {
  const rows = ["A", "B", "C", "D", "E", "F", "G"];

  const getSeat = (name) => {
    return seats.find(s => s.seatName === name || s.name === name);
  };

  // Kiểm tra ghế có đang được chọn không
  const isSeatSelected = (seatId) => {
    return selectedSeats.some(s => s.id === seatId);
  };

  if (!seats || seats.length === 0) {
    return <div className="text-center py-4">Đang tải sơ đồ ghế...</div>;
  }

  return (
    <div>
      <div className="text-center mb-3 fw-bold">
        🧑‍✈️ Tài xế
      </div>

      {rows.map(row => (
        <Row key={row} className="mb-2 justify-content-center">
          {/* Ghế trái (1-2) */}
          {[1, 2].map(num => {
            const seatName = row + num;
            const seat = getSeat(seatName);
            const isSelected = seat && isSeatSelected(seat.id);

            return (
              <Col xs={2} key={seatName}>
                <Button
                  className="w-100"
                  variant={
                    !seat ? "secondary" :
                      seat.status === "AVAILABLE" ? (isSelected ? "warning" : "outline-success") :
                        "secondary"
                  }
                  disabled={!seat || seat.status !== "AVAILABLE"}
                  active={isSelected}
                  onClick={() => seat && onSeatSelect(seat)}
                >
                  {seatName}
                </Button>
              </Col>
            );
          })}

          <Col xs={1} className="text-center text-muted">⬇️</Col> {/* lối đi */}

          {/* Ghế phải (3-4) */}
          {[3, 4].map(num => {
            const seatName = row + num;
            const seat = getSeat(seatName);
            const isSelected = seat && isSeatSelected(seat.id);

            return (
              <Col xs={2} key={seatName}>
                <Button
                  className="w-100"
                  variant={
                    !seat ? "secondary" :
                      seat.status === "AVAILABLE" ? (isSelected ? "warning" : "outline-success") :
                        "secondary"
                  }
                  disabled={!seat || seat.status !== "AVAILABLE"}
                  active={isSelected}
                  onClick={() => seat && onSeatSelect(seat)}
                >
                  {seatName}
                </Button>
              </Col>
            );
          })}
        </Row>
      ))}

      {/* Chú thích */}
      <div className="mt-4 d-flex justify-content-center gap-4">
        <div className="d-flex align-items-center">
          <Button size="sm" variant="outline-success" className="me-2" style={{ width: 40 }}>A1</Button>
          <span className="small">Còn trống</span>
        </div>
        <div className="d-flex align-items-center">
          <Button size="sm" variant="warning" className="me-2" style={{ width: 40 }}>A2</Button>
          <span className="small">Đang chọn</span>
        </div>
        <div className="d-flex align-items-center">
          <Button size="sm" variant="danger" className="me-2" style={{ width: 40 }} disabled>A3</Button>
          <span className="small">Đã đặt</span>
        </div>
      </div>
    </div>
  );
}