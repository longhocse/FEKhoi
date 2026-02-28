const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");

router.get("/:tripId", seatController.getSeats);
router.post("/hold", seatController.holdSeats);
router.post("/confirm", seatController.confirmSeats);

module.exports = router;