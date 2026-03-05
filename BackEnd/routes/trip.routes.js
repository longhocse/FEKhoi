// routes/trip.routes.js
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// API đơn giản nhất - lấy tất cả trips
router.get('/all', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        t.id,
        sFrom.name as fromStation,
        sTo.name as toStation,
        t.startTime,
        t.price,
        t.estimatedDuration,
        v.name as vehicleName,
        pc.name as companyName
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      JOIN Vehicles v ON t.vehicleId = v.id
      JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
    `);
    
    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/simple', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        t.id,
        sFrom.name as fromStation,
        sTo.name as toStation,
        t.startTime,
        t.price,
        t.estimatedDuration,
        v.name as vehicleName,
        v.type as vehicleType,
        pc.name as companyName,
        pc.logo as companyLogo,
        (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id AND status = 'AVAILABLE') as availableSeats,
        (SELECT TOP 1 imageUrl FROM ImageVehicles WHERE vehicleId = v.id AND isPrimary = 1) as image
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      JOIN Vehicles v ON t.vehicleId = v.id
      JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
      WHERE t.isActive = 1
    `);
    
    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Lỗi:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/search-simple', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const pool = await poolPromise;
    
    // Lấy tất cả trips kèm tên bến xe
    const result = await pool.request().query(`
      SELECT 
        t.id,
        sFrom.name as fromStation,
        sTo.name as toStation,
        t.startTime,
        t.price,
        t.estimatedDuration
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      WHERE t.isActive = 1
    `);
    
    // Lọc trong JavaScript
    let filtered = result.recordset;
    
    if (from) {
      filtered = filtered.filter(item => 
        item.fromStation.toLowerCase().includes(from.toLowerCase())
      );
    }
    
    if (to) {
      filtered = filtered.filter(item => 
        item.toStation.toLowerCase().includes(to.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// API search đơn giản
router.get('/search', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        t.id,
        sFrom.name as fromStation,
        sTo.name as toStation,
        t.startTime,
        t.price,
        t.estimatedDuration,
        v.name as vehicleName,
        pc.name as companyName
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      JOIN Vehicles v ON t.vehicleId = v.id
      JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
    `);
    
    // Lọc thủ công trong code
    let filtered = result.recordset;
    
    if (from) {
      filtered = filtered.filter(item => 
        item.fromStation.includes(from)
      );
    }
    
    if (to) {
      filtered = filtered.filter(item => 
        item.toStation.includes(to)
      );
    }
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// routes/trip.routes.js - Sửa phần lấy chi tiết chuyến xe

router.get('/popular', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 6
        t.id,
        sFrom.name as fromStation,
        sTo.name as toStation,
        t.price,
        t.startTime,
        t.estimatedDuration
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      WHERE t.isActive = 1
      ORDER BY t.startTime
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy chi tiết chuyến xe theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    // Kiểm tra ID có phải số không
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID không hợp lệ'
      });
    }

    console.log(`🔍 Đang tìm trip ID: ${id}`);
    
    // Lấy thông tin chuyến xe
    const tripResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          t.id,
          sFrom.name as fromStation,
          sFrom.address as fromAddress,
          sFrom.province as fromProvince,
          sTo.name as toStation,
          sTo.address as toAddress,
          sTo.province as toProvince,
          t.startTime,
          t.price,
          t.estimatedDuration,
          t.imageUrl,
          v.id as vehicleId,
          v.name as vehicleName,
          v.type as vehicleType,
          v.numberOfFloors,
          pc.name as companyName,
          pc.phone as companyPhone,
          pc.email as companyEmail,
          pc.logo as companyLogo,
          (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id AND status = 'AVAILABLE') as availableSeats
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
        WHERE t.id = @id AND t.isActive = 1
      `);
    
    if (tripResult.recordset.length === 0) {
      console.log(`❌ Không tìm thấy trip ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy chuyến xe'
      });
    }

    const trip = tripResult.recordset[0];
    console.log(`✅ Tìm thấy trip: ${trip.fromStation} -> ${trip.toStation}`);

    // Lấy danh sách ghế
    const seatsResult = await pool.request()
      .input('vehicleId', sql.Int, trip.vehicleId)
      .input('tripId', sql.Int, id)
      .query(`
        SELECT 
          s.id,
          s.name as seatName,
          s.floor,
          s.type as seatType,
          CASE 
            WHEN tk.id IS NOT NULL AND tk.status IN ('BOOKED', 'PAID') THEN 'BOOKED'
            ELSE s.status
          END as status
        FROM Seats s
        LEFT JOIN Tickets tk ON s.id = tk.seatId AND tk.tripId = @tripId
        WHERE s.vehicleId = @vehicleId
        ORDER BY s.floor, s.name
      `);

    res.json({
      success: true,
      data: {
        ...trip,
        seats: seatsResult.recordset
      }
    });
  } catch (err) {
    console.error('❌ Lỗi lấy chi tiết chuyến xe:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});


module.exports = router;