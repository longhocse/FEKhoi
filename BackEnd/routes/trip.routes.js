// routes/trip.routes.js
const express = require('express');
const router = express.Router();

const {
  getTrips,
  getAllTrips,
  getSimpleTrips,
  searchTrips,
  getPopularTrips,
  getTripById
} = require("../controllers/trip.controller");


router.get("/trips", getTrips);
router.get("/all", getAllTrips);
router.get("/simple", getSimpleTrips);
router.get("/search", searchTrips);
router.get("/popular", getPopularTrips);
router.get("/:id", getTripById);

module.exports = router;