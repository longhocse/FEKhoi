const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/tickets", authMiddleware, async (req, res) => {
  try {
    console.log("🔥 partnerTrips route ticket loaded");
    const partnerId = req.user.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input("PartnerId", partnerId)
      .execute("sp_GetPartnerTickets");

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error("❌ getPartnerTickets error:", error);
    res.status(500).json({ success: false });
  }
});

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

         
          CASE 
            WHEN tk.id IS NOT NULL THEN 'BOOKED'
            ELSE s.status
          END AS status

        FROM Seats s
        JOIN Trips t ON s.vehicleId = t.vehicleId

        
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

router.get('/trips/:id/bookings', async (req, res) => {
  try {
    const tripId = req.params.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('TripId', tripId)
      .query(`
        SELECT 
            tk.id AS ticketId,
            tk.status,
            tk.totalAmount,
            tk.paymentMethod,
            tk.bookedAt,

            s.id AS seatId,
            s.name AS seatName,
            s.floor,
            s.type AS seatType,

            u.id AS userId,
            u.name AS customerName,
            u.phoneNumber AS phone

        FROM Tickets tk
        JOIN Seats s ON tk.seatId = s.id
        JOIN Users u ON tk.userId = u.id

        WHERE tk.tripId = @TripId
        ORDER BY tk.bookedAt DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});



// ================= ADD TRIP =================
router.post("/trips", async (req, res) => {
  console.log("🔥 POST /partnerTrips/trips called ");
  console.log("📥 BODY:", req.body);
  const transaction = new sql.Transaction(await poolPromise);

  try {
    const {
      fromStationId,
      toStationId,
      startTime,
      arrivalTime,
      price,
      vehicleId,
      imageUrl,
      timePoints = [],
      endDate,
      weekdays = []
    } = req.body;

    // validate
    if (!fromStationId || !toStationId || !startTime || !arrivalTime || !vehicleId || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // parse thời gian gốc (ngày đầu tiên)
    const baseStart = new Date(startTime.replace(" ", "T") + "+07:00");
    const baseArrival = new Date(arrivalTime.replace(" ", "T") + "+07:00");

    // ngày kết thúc (chỉ lấy date)
    const endDateObj = new Date(endDate + "T23:59:59+07:00");

    await transaction.begin();

    let currentDate = new Date(baseStart);
    let createdTripIds = [];

    while (currentDate <= endDateObj) {

      const dayOfWeek = currentDate.getDay();

      // ❌ bỏ qua nếu không nằm trong weekday đã chọn
      if (!weekdays.includes(dayOfWeek)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // clone ngày hiện tại
      const start = new Date(currentDate);
      start.setHours(baseStart.getHours(), baseStart.getMinutes(), 0, 0);

      const arrival = new Date(currentDate);
      arrival.setHours(baseArrival.getHours(), baseArrival.getMinutes(), 0, 0);

      // nếu qua ngày hôm sau
      if (arrival <= start) {
        arrival.setDate(arrival.getDate() + 1);
      }

      const estimatedDuration = Math.floor((arrival - start) / 60000);

      // insert trip
      const tripResult = await new sql.Request(transaction)
        .input("fromStationId", sql.Int, fromStationId)
        .input("toStationId", sql.Int, toStationId)
        .input("vehicleId", sql.Int, vehicleId)
        .input("startTime", sql.DateTime, start)
        .input("price", sql.Decimal(10, 2), price)
        .input("estimatedDuration", sql.Int, estimatedDuration)
        .input("imageUrl", sql.NVarChar, imageUrl)
        .query(`
      INSERT INTO Trips
      (fromStationId, toStationId, vehicleId, startTime, price, estimatedDuration, imageUrl)
      OUTPUT INSERTED.id
      VALUES
      (@fromStationId, @toStationId, @vehicleId, @startTime, @price, @estimatedDuration, @imageUrl)
    `);

      const tripId = tripResult.recordset[0].id;
      createdTripIds.push(tripId);

      // insert timePoints
      for (const tp of timePoints) {
        await new sql.Request(transaction)
          .input("tripId", sql.Int, tripId)
          .input("pointId", sql.Int, tp.pointId)
          .input("arrivalTime", sql.VarChar, tp.arrivalTime)
          .input("departureTime", sql.VarChar, tp.departureTime)
          .input("stopDuration", sql.Int, tp.stopDuration || 0)
          .query(`
        INSERT INTO TimePoints
        (tripId, pointId, arrivalTime, departureTime, stopDuration)
        VALUES
        (@tripId, @pointId, @arrivalTime, @departureTime, @stopDuration)
      `);
      }

      // tăng ngày
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await transaction.commit();

    res.json({
      message: "Created multiple trips successfully",
      totalTrips: createdTripIds.length,
      tripIds: createdTripIds
    });

  } catch (err) {
    await transaction.rollback();

    console.error("🔥 ERROR:", err);
    console.error("🔥 SQL ERROR:", err.originalError);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;