import React from "react";
import { Container, Card, Badge } from "react-bootstrap";
import mockBookings from "../data/mockBookings";

function MyTickets() {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">🎫 Vé đã đặt</h2>

      {mockBookings.length === 0 ? (
        <p>Bạn chưa đặt vé nào.</p>
      ) : (
        mockBookings.map((ticket) => (
          <Card key={ticket.id} className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>
                {ticket.from} → {ticket.to}
              </Card.Title>

              <Card.Text>
                🚌 <strong>Nhà xe:</strong> {ticket.busName} <br />
                ⏰ <strong>Thời gian khởi hành:</strong> {ticket.departureTime} <br />
                📅 <strong>Thời gian đặt vé:</strong> {ticket.bookedAt}
              </Card.Text>

              <Badge bg="success">
                💳 Thanh toán: {ticket.paymentMethod}
              </Badge>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export default MyTickets;
