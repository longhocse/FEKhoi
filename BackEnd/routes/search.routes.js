// routes/search.routes.js
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// API tìm kiếm chuyến xe
router.get('/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    console.log('Tìm kiếm:', { from, to, date });

    const pool = await poolPromise;
    const request = pool.request();

    let query = `
      SELECT 
        t.id,
        sFrom.name as fromStation,
        sFrom.province as fromProvince,
        sFrom.address as fromAddress,
        sTo.name as toStation,
        sTo.province as toProvince,
        sTo.address as toAddress,
        t.startTime,
        t.price,
        t.estimatedDuration,
        t.imageUrl, -- ✅ thêm dòng này
        v.name as vehicleName,
        v.type as vehicleType,
        v.description as vehicleDescription,
        pc.name as companyName,
        pc.phone as companyPhone,
        pc.logo as companyLogo,
        (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id AND status = 'AVAILABLE') as availableSeats,
        (SELECT TOP 1 imageUrl 
         FROM ImageVehicles 
         WHERE vehicleId = v.id AND isPrimary = 1) as vehicleImage
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      JOIN Vehicles v ON t.vehicleId = v.id
      JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
      WHERE t.isActive = 1
    `;

    if (date) {
      query += ` AND CAST(t.startTime AS DATE) = @date`;
      request.input('date', sql.Date, date);
    } else {
      query += ` AND t.startTime > GETDATE()`;
    }

    if (from) {
      query += ` AND (
        sFrom.name LIKE @from 
        OR sFrom.province LIKE @from 
        OR sFrom.address LIKE @from
      )`;
      request.input('from', sql.NVarChar, `%${from}%`);
    }

    if (to) {
      query += ` AND (
        sTo.name LIKE @to 
        OR sTo.province LIKE @to 
        OR sTo.address LIKE @to
      )`;
      request.input('to', sql.NVarChar, `%${to}%`);
    }

    query += ` ORDER BY t.startTime ASC`;

    const result = await request.query(query);

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });

  } catch (err) {
    console.error('Lỗi tìm kiếm:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// API lấy danh sách gợi ý điểm đi/đến
router.get('/suggestions', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return res.json([]);
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('keyword', sql.NVarChar, `%${keyword}%`)
      .query(`
        SELECT DISTINCT 
          name as value,
          province as label,
          'station' as type
        FROM Stations 
        WHERE name LIKE @keyword OR province LIKE @keyword
        UNION
        SELECT DISTINCT 
          province as value,
          province as label,
          'province' as type
        FROM Stations 
        WHERE province LIKE @keyword
        ORDER BY value
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;