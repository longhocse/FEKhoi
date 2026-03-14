const express = require("express");
const router = express.Router();

const { sql, poolPromise } = require("../config/db");

// ================= GET VEHICLES =================
router.get("/vehicles/:partnerId", async (req, res) => {
  try {
    const { partnerId } = req.params;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("partnerId", sql.Int, partnerId)
      .query("SELECT * FROM Vehicles WHERE partnerId = @partnerId");

    res.json(result.recordset);
  } catch (err) {
    console.error("GET vehicles error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADD VEHICLE =================
router.post("/vehicles", async (req, res) => {
  try {
    const { name, licensePlate, type, numberOfFloors, partnerId } = req.body;

    const pool = await poolPromise;

    await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("licensePlate", sql.VarChar, licensePlate)
      .input("type", sql.NVarChar, type)
      .input("numberOfFloors", sql.Int, numberOfFloors)
      .input("partnerId", sql.Int, partnerId)
      .query(`
        INSERT INTO Vehicles 
        (name, licensePlate, type, numberOfFloors, partnerId, isActive)
        VALUES (@name, @licensePlate, @type, @numberOfFloors, @partnerId, 1)
      `);

    res.json({ message: "Thêm thành công" });
  } catch (err) {
    console.error("POST vehicles error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;