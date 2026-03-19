const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.put("/trips/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE Trips
        SET isActive = 0
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({ message: "Deleted (soft)" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/trips/:tripId/seats", async (req, res) => {
  try {
    const { tripId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("tripId", sql.Int, tripId)
      .query(`
        SELECT 
          s.id,
          s.name,
          s.floor,

          -- 👇 LOGIC CHÍNH
          CASE 
            WHEN tk.id IS NOT NULL THEN 'BOOKED'
            ELSE s.status
          END AS status

        FROM Seats s
        JOIN Trips t ON s.vehicleId = t.vehicleId

        -- 👇 JOIN TICKETS
        LEFT JOIN Tickets tk 
          ON tk.seatId = s.id
          AND tk.tripId = @tripId
          AND tk.status IN ('BOOKED','PAID')

        WHERE t.id = @tripId

        ORDER BY s.floor, s.name
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.put("/seats/:id/lock", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE Seats
        SET status = 'MAINTENANCE'
        WHERE id = @id AND status = 'AVAILABLE'
      `);

    res.json({ message: "Seat locked" });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


router.put("/seats/:id/unlock", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE Seats
        SET status = 'AVAILABLE'
        WHERE id = @id AND status = 'MAINTENANCE'
      `);

    res.json({ message: "Seat unlocked" });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get("/trips/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
  SELECT 
    id,
    fromStationId,
    toStationId,
    vehicleId,
    startTime,
    DATEADD(MINUTE, estimatedDuration, startTime) AS arrivalTime,
    price,
    imageUrl
  FROM Trips
  WHERE id = @id
`)

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.put("/trips/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fromStationId,
      toStationId,
      startTime,
      arrivalTime,
      price,
      vehicleId,
      imageUrl
    } = req.body;

    const start = new Date(startTime);
    const arrival = new Date(arrivalTime);

    const estimatedDuration = Math.floor((arrival - start) / 60000);

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .input("fromStationId", sql.Int, fromStationId)
      .input("toStationId", sql.Int, toStationId)
      .input("vehicleId", sql.Int, vehicleId)
      .input("startTime", sql.DateTime, start)
      .input("price", sql.Decimal(10, 2), price)
      .input("estimatedDuration", sql.Int, estimatedDuration)
      .input("imageUrl", sql.NVarChar, imageUrl)
      .query(`
        UPDATE Trips
        SET 
          fromStationId = @fromStationId,
          toStationId = @toStationId,
          vehicleId = @vehicleId,
          startTime = @startTime,
          price = @price,
          estimatedDuration = @estimatedDuration,
          imageUrl = @imageUrl
        WHERE id = @id
      `);

    res.json({ message: "Updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


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