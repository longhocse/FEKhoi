const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

/*
Seat status:
available
held
booked
*/

let trips = [
  {
    id: "trip1",
    seats: generateSeats(40)
  }
];

function generateSeats(total) {
  const seats = [];
  for (let i = 1; i <= total; i++) {
    seats.push({
      seatNumber: i,
      status: "available",
      holdBy: null
    });
  }
  return seats;
}

/* ==============================
1️⃣ GET SEATS OF A TRIP
================================ */
app.get("/api/seats/:tripId", (req, res) => {
  const { tripId } = req.params;
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  res.json(trip.seats);
});

/* ==============================
2️⃣ HOLD SEATS
================================ */
app.post("/api/seats/hold", (req, res) => {
  const { tripId, seatNumbers } = req.body;

  const trip = trips.find(t => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const sessionId = uuidv4();

  for (let seatNum of seatNumbers) {
    const seat = trip.seats.find(s => s.seatNumber === seatNum);

    if (!seat || seat.status !== "available") {
      return res.status(400).json({
        message: `Seat ${seatNum} is not available`
      });
    }
  }

  seatNumbers.forEach(seatNum => {
    const seat = trip.seats.find(s => s.seatNumber === seatNum);
    seat.status = "held";
    seat.holdBy = sessionId;
  });

  res.json({
    message: "Seats held successfully",
    sessionId
  });
});

/* ==============================
3️⃣ CONFIRM BOOKING
================================ */
app.post("/api/seats/confirm", (req, res) => {
  const { tripId, sessionId } = req.body;

  const trip = trips.find(t => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const heldSeats = trip.seats.filter(
    seat => seat.holdBy === sessionId
  );

  if (heldSeats.length === 0) {
    return res.status(400).json({ message: "No seats held" });
  }

  heldSeats.forEach(seat => {
    seat.status = "booked";
    seat.holdBy = null;
  });

  res.json({ message: "Booking confirmed" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});