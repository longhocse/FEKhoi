const express = require("express");
const router = express.Router();
const { getPopularTrips, getTrips,getTripById } = require("../controllers/tripController");


router.get("/popular", getPopularTrips);
router.get("/", getTrips);
router.get("/:id", getTripById);

module.exports = router;