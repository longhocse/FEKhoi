const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

// ================= GET TRIPS =================
router.get("/trips/:partnerId", async (req, res) => {
  try {
    const { partnerId } = req.params;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("partnerId", sql.Int, partnerId)
      .query(`
        SELECT * FROM Trips 
        WHERE partnerId = @partnerId
        ORDER BY departureTime DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("GET trips error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADD TRIP =================
router.post("/trips", async (req, res) => {
  try {
    const { routeName, vehicleName, departureTime, price, partnerId } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("routeName", sql.NVarChar, routeName)
      .input("vehicleName", sql.NVarChar, vehicleName)
      .input("departureTime", sql.DateTime, departureTime)
      .input("price", sql.Decimal(12,2), price)
      .input("partnerId", sql.Int, partnerId)
      .query(`
        INSERT INTO Trips (routeName, vehicleName, departureTime, price, partnerId)
        VALUES (@routeName, @vehicleName, @departureTime, @price, @partnerId)
      `);

    res.json({ message: "Thêm chuyến thành công" });
  } catch (err) {
    console.error("POST trip error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;