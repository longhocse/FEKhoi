import { Row, Col, Button } from "react-bootstrap";

export default function SeatLayout({ seats = [], selectedSeat, setSelectedSeat }) {
  const rows = ["A", "B", "C", "D", "E", "F", "G"];

  const getSeat = (name) => {
    return seats.find(s => s.seatName === name || s.name === name);
  };

  // Kiểm tra nếu không có ghế
  if (!seats || seats.length === 0) {
    return <div className="text-center py-4">Đang tải sơ đồ ghế...</div>;
  }

  return (
    <div>
      <div className="text-center mb-3 fw-bold">
        🧑‍✈️ Driver
      </div>

      {rows.map(row => (
        <Row key={row} className="mb-2 justify-content-center">
          {[1, 2].map(num => {
            const seatName = row + num;
            const seat = getSeat(seatName);

            return (
              <Col xs={2} key={seatName}>
                <Button
                  className="w-100"
                  variant={
                    !seat ? "secondary" :
                      seat.status === "AVAILABLE" ? "outline-success" :
                        "secondary"
                  }
                  disabled={!seat || seat.status !== "AVAILABLE"}
                  active={selectedSeat === seat?.id}
                  onClick={() => {
                    if (seat && seat.status === "AVAILABLE") {
                      setSelectedSeat(seat.id); // Gửi ID
                    }
                  }}
                >
                  {seatName}
                </Button>
              </Col>
            );
          })}

          <Col xs={1}></Col> {/* lối đi */}

          {[3, 4].map(num => {
            const seatName = row + num;
            const seat = getSeat(seatName);

            return (
              <Col xs={2} key={seatName}>
                <Button
                  className="w-100"
                  variant={
                    !seat ? "secondary" :
                      seat.status === "AVAILABLE" ? "outline-success" :
                        "secondary"
                  }
                  disabled={!seat || seat.status !== "AVAILABLE"}
                  active={selectedSeat === seat?.id}
                  onClick={() => {
                    if (seat && seat.status === "AVAILABLE") {
                      setSelectedSeat(seat.id); // Gửi ID
                    }
                  }}
                >
                  {seatName}
                </Button>
              </Col>
            );
          })}
        </Row>
      ))}
    </div>
  );
}