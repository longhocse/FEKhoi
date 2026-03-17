const express = require('express');
const router = express.Router();
const tripController = require("../controllers/trip.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes - không cần xác thực
router.get("/trips", tripController.getTrips);
router.get("/all", tripController.getAllTrips);
router.get("/simple", tripController.getSimpleTrips);
router.get("/search", tripController.searchTrips);
router.get("/popular", tripController.getPopularTrips);
router.get("/:id", tripController.getTripById);

// Protected routes - cần xác thực
router.post("/book", authMiddleware, tripController.bookTicket);

module.exports = router;