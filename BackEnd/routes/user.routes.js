const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { poolPromise } = require("../config/db");

router.get("/trips", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        t.id,
        t.fromStation,
        t.toStation,
        t.startTime,
        t.price,
        v.name AS vehicleName
      FROM Trips t
      LEFT JOIN Vehicles v ON t.vehicleId = v.id
      ORDER BY t.startTime DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;