const express = require("express");
const router = express.Router();
const tripController = require("../controllers/trip.controller");
const { pool, poolConnect } = require("../config/db");

// ===== GET VEHICLES =====
router.get("/vehicles", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query("SELECT * FROM Vehicles");
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Vehicles error:", err);
    res.json([]);
  }
});

// ===== GET TRIPS =====
router.get("/trips", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query("SELECT * FROM Trips");
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Trips error:", err);
    res.json([]);
  }
});

router.get("/trips/:partnerId", tripController.getTripsByPartner);

// ===== SETTINGS =====
router.get("/settings", (req, res) => {
  res.json({ message: "Partner settings OK 🚀" });
});

module.exports = router;