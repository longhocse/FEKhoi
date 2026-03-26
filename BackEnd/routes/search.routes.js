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
    t.imageUrl,

    v.name as vehicleName,
    v.type as vehicleType,
    v.description as vehicleDescription,

    pc.name as companyName,
    pc.phone as companyPhone,
    pc.logo as companyLogo,

    (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id AND status = 'AVAILABLE') as availableSeats,

    (SELECT TOP 1 imageUrl 
     FROM ImageVehicles 
     WHERE vehicleId = v.id AND isPrimary = 1) as vehicleImage,

    sv.name as serviceName   -- ✅ thêm dòng này

  FROM Trips t
  JOIN Stations sFrom ON t.fromStationId = sFrom.id
  JOIN Stations sTo ON t.toStationId = sTo.id
  JOIN Vehicles v ON t.vehicleId = v.id
  JOIN PassengerCarCompanies pc ON v.partnerId = pc.id

  LEFT JOIN VehicleServices vs ON v.id = vs.vehicleId
  LEFT JOIN Services sv ON vs.serviceId = sv.id

  WHERE t.isActive = 1
`;

    if (date) {
      query += ` AND CAST(t.startTime AS DATE) = @date`;
      request.input('date', sql.Date, date);
    } else {
      query += ` AND t.startTime > DATEADD(HOUR, 0, GETUTCDATE())`;
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

    const raw = result.recordset;
    const tripsMap = {};

    raw.forEach(row => {
      if (!tripsMap[row.id]) {
        tripsMap[row.id] = {
          id: row.id,
          fromStation: row.fromStation,
          fromProvince: row.fromProvince,
          fromAddress: row.fromAddress,
          toStation: row.toStation,
          toProvince: row.toProvince,
          toAddress: row.toAddress,
          startTime: row.startTime,
          price: row.price,
          estimatedDuration: row.estimatedDuration,
          imageUrl: row.imageUrl,
          vehicleName: row.vehicleName,
          vehicleType: row.vehicleType,
          vehicleDescription: row.vehicleDescription,
          companyName: row.companyName,
          companyPhone: row.companyPhone,
          companyLogo: row.companyLogo,
          availableSeats: row.availableSeats,
          vehicleImage: row.vehicleImage,
          services: []
        };
      }

      if (row.serviceName) {
        // tránh duplicate service
        const exists = tripsMap[row.id].services.some(
          s => s.name === row.serviceName
        );

        if (!exists) {
          tripsMap[row.id].services.push({
            name: row.serviceName
          });
        }
      }
    });

    const trips = Object.values(tripsMap);

    res.json({
      success: true,
      count: trips.length,
      data: trips
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