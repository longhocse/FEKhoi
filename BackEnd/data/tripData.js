const { v4: uuidv4 } = require("uuid");

let trips = [
  {
    id: "trip1",
    seats: Array.from({ length: 40 }, (_, i) => ({
      seatNumber: i + 1,
      status: "available", // available | held | booked
      holdBy: null,
    })),
  },
];

module.exports = { trips };