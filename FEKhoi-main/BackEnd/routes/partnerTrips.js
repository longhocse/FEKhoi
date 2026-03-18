const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

// ================= GET TRIPS =================
// router.get("/trips/:partnerId", async (req, res) => {
//   try {
//     const { partnerId } = req.params;
//     const pool = await poolPromise;

//     const result = await pool
//       .request()
//       .input("partnerId", sql.Int, partnerId)
//       .query(`
//         SELECT * FROM Trips 
//         WHERE partnerId = @partnerId
//         ORDER BY departureTime DESC
//       `);

//     res.json(result.recordset);
//   } catch (err) {
//     console.error("GET trips error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/stations", async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .query("SELECT id, name FROM Stations ORDER BY name");

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


// ================= ADD TRIP =================
router.post("/trips", async (req, res) => {
  try {

    const {
      fromStationId,
      toStationId,
      startTime,
      arrivalTime,
      price,
      vehicleId,
      imageUrl
    } = req.body;

    if (!fromStationId || !toStationId || !startTime || !arrivalTime || !vehicleId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(startTime);
    const arrival = new Date(arrivalTime);

    const estimatedDuration = Math.floor((arrival - start) / 60000);

    const pool = await poolPromise;

    await pool.request()
      .input("fromStationId", sql.Int, fromStationId)
      .input("toStationId", sql.Int, toStationId)
      .input("vehicleId", sql.Int, vehicleId)
      .input("startTime", sql.DateTime, start)
      .input("price", sql.Decimal(10, 2), price)
      .input("estimatedDuration", sql.Int, estimatedDuration)
      .input("imageUrl", sql.NVarChar, imageUrl)   // thêm dòng này
      .query(`
        INSERT INTO Trips
        (fromStationId, toStationId, vehicleId, startTime, price, estimatedDuration, imageUrl)
        VALUES
        (@fromStationId, @toStationId, @vehicleId, @startTime, @price, @estimatedDuration, @imageUrl)
      `);

    res.json({ message: "Trip created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;