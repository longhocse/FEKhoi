const express = require("express");
const router = express.Router();

const { sql, poolPromise } = require("../config/db");

// ================= GET VEHICLES =================
router.get("/vehicles/:partnerId", async (req, res) => {
  try {
    const partnerId = parseInt(req.params.partnerId);

    if (isNaN(partnerId)) {
      return res.status(400).json({ message: "partnerId phải là số" });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("partnerId", sql.Int, partnerId)
      .query(`
        SELECT 
          v.id,
          v.name,
          v.licensePlate,
          v.type,
          v.numberOfFloors,
          v.isActive,
          STRING_AGG(s.name, ',') AS services
        FROM Vehicles v
        LEFT JOIN VehicleServices vs ON v.id = vs.vehicleId
        LEFT JOIN Services s ON vs.serviceId = s.id
        WHERE v.partnerId = @partnerId
        GROUP BY 
          v.id, v.name, v.licensePlate, 
          v.type, v.numberOfFloors, v.isActive
        ORDER BY v.id DESC
      `);

    // 👉 convert string → array
    const vehicles = result.recordset.map(v => ({
      ...v,
      services: v.services ? v.services.split(',') : []
    }));

    res.json(vehicles);

  } catch (err) {
    console.error("GET vehicles error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/vehicles/:id/seats", async (req, res) => {

  const pool = await poolPromise;

  const result = await pool.request()
    .input("vehicleId", sql.Int, req.params.id)
    .query(`
      SELECT id, name, floor, type, status
      FROM Seats
      WHERE vehicleId = @vehicleId
      ORDER BY floor, name
    `);

  res.json(result.recordset);
});

router.get("/services", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT id, name FROM Services WHERE isActive = 1
    `);

    res.json(result.recordset);

  } catch (err) {
    console.error("GET services error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ================= ADD VEHICLE =================
router.post("/vehicles", async (req, res) => {
  try {
    const { name, licensePlate, type, numberOfFloors, partnerId, services } = req.body;

    const pool = await poolPromise;

    // check duplicate
    const check = await pool.request()
      .input("licensePlate", sql.VarChar, licensePlate)
      .query(`
    SELECT id FROM Vehicles WHERE licensePlate = @licensePlate
  `);

    if (check.recordset.length > 0) {
      return res.status(400).json({
        message: "Biển số xe đã tồn tại!"
      });
    }

    const result = await pool.request()
      .input("name", sql.NVarChar, name)
      .input("licensePlate", sql.VarChar, licensePlate)
      .input("type", sql.NVarChar, type)
      .input("numberOfFloors", sql.Int, numberOfFloors)
      .input("partnerId", sql.Int, partnerId)
      .query(`
        INSERT INTO Vehicles (name, licensePlate, type, numberOfFloors, partnerId, isActive)
        VALUES (@name, @licensePlate, @type, @numberOfFloors, @partnerId, 1);

        SELECT SCOPE_IDENTITY() AS vehicleId;
      `);

    const vehicleId = result.recordset[0].vehicleId;

    // 👉 thêm services nếu có
    if (services && services.length > 0) {
      for (let serviceId of services) {
        await pool.request()
          .input("vehicleId", sql.Int, vehicleId)
          .input("serviceId", sql.Int, serviceId)
          .query(`
        INSERT INTO VehicleServices (vehicleId, serviceId)
        VALUES (@vehicleId, @serviceId)
      `);
      }
    }

    res.json({ message: "Thêm xe + service thành công" });

  } catch (err) {
    console.error("POST vehicles error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;