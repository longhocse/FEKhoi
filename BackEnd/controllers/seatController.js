const { trips } = require("../data/tripData");
const { v4: uuidv4 } = require("uuid");

// GET SEATS
exports.getSeats = (req, res) => {
  const { tripId } = req.params;

  const trip = trips.find((t) => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  res.json(trip.seats);
};

// HOLD SEATS
exports.holdSeats = (req, res) => {
  const { tripId, seatNumbers } = req.body;

  const trip = trips.find((t) => t.id === Number(tripId));
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const selectedSeats = trip.seats.filter((seat) =>
    seatNumbers.includes(seat.seatNumber)
  );

  const hasUnavailable = selectedSeats.some(
    (seat) => seat.status !== "available"
  );

  if (hasUnavailable) {
    return res.status(400).json({
      message: "Some seats are not available",
    });
  }

  const sessionId = uuidv4();

  selectedSeats.forEach((seat) => {
    seat.status = "held";
    seat.holdBy = sessionId;
  });

  // AUTO RELEASE SAU 5 PHÚT
  setTimeout(() => {
    trip.seats.forEach((seat) => {
      if (seat.holdBy === sessionId && seat.status === "held") {
        seat.status = "available";
        seat.holdBy = null;
      }
    });
  }, 5 * 60 * 1000);

  res.json({
    message: "Seats held successfully",
    sessionId,
  });
};

// CONFIRM SEATS
exports.confirmSeats = (req, res) => {
  const { tripId, sessionId } = req.body;

  const trip = trips.find((t) => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  const seatsToConfirm = trip.seats.filter(
    (seat) => seat.holdBy === sessionId
  );

  if (seatsToConfirm.length === 0) {
    return res.status(400).json({
      message: "No seats to confirm",
    });
  }

  seatsToConfirm.forEach((seat) => {
    seat.status = "booked";
    seat.holdBy = null;
  });

  res.json({
    message: "Booking confirmed",
  });
};