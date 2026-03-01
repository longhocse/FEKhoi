const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// 👇 Thêm dòng này
router.get("/partners", adminController.getPartners);
router.get("/trips", adminController.getTrips);
router.put("/trips/:id/toggle", adminController.toggleTripStatus);
module.exports = router;