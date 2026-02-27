const express = require("express");
const router = express.Router();
const { getPopularTrips, getTrips } = require("../controllers/tripController");


router.get("/popular", getPopularTrips);
router.get("/", getTrips);

module.exports = router;