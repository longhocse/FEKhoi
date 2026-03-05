// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// Dashboard tổng quan
router.get('/dashboard', async (req, res) => {
  try {
    console.log("📊 Admin dashboard API được gọi");
    
    const pool = await poolPromise;
    
    // 1. Đếm tổng số users
    const totalUsers = await pool.request()
      .query("SELECT COUNT(*) as count FROM Users WHERE role = 'customer'");
    
    // 2. Đếm tổng số nhà xe (partners)
    const totalPartners = await pool.request()
      .query("SELECT COUNT(*) as count FROM Users WHERE role = 'partner'");
    
    // 3. Đếm tổng số chuyến xe
    const totalTrips = await pool.request()
      .query("SELECT COUNT(*) as count FROM Trips WHERE isActive = 1");
    
    // 4. Tính tổng doanh thu
    const totalRevenue = await pool.request()
      .query("SELECT ISNULL(SUM(totalAmount), 0) as total FROM Tickets WHERE status IN ('PAID', 'USED')");
    
    // 5. Đếm số vé đã bán
    const totalTickets = await pool.request()
      .query("SELECT COUNT(*) as count FROM Tickets WHERE status IN ('PAID', 'USED')");
    
    res.json({
      success: true,
      data: {
        totalUsers: totalUsers.recordset[0].count,
        totalPartners: totalPartners.recordset[0].count,
        totalTrips: totalTrips.recordset[0].count,
        totalRevenue: totalRevenue.recordset[0].total,
        totalTickets: totalTickets.recordset[0].count,
        monthlyStats: []
      }
    });
    
  } catch (err) {
    console.error('❌ Lỗi dashboard:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Lấy danh sách người dùng
router.get('/users', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phoneNumber,
        u.role,
        u.isActive,
        u.createdAt,
        u.updatedAt,
        w.balance,
        w.currency
      FROM Users u
      LEFT JOIN Wallets w ON u.id = w.userId
      ORDER BY u.createdAt DESC
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách users:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Thêm người dùng mới
router.post('/users', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, role } = req.body;
    
    // Validate dữ liệu
    if (!name || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    const pool = await poolPromise;
    
    // Kiểm tra email đã tồn tại chưa
    const checkEmail = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');
    
    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email đã được sử dụng'
      });
    }

    // Thêm user mới
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.VarChar, email)
      .input('phoneNumber', sql.VarChar, phoneNumber)
      .input('password', sql.VarChar, password)
      .input('role', sql.VarChar, role)
      .input('isActive', sql.Bit, 1)
      .query(`
        INSERT INTO Users (name, email, phoneNumber, password, role, isActive)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @phoneNumber, @password, @role, @isActive)
      `);

    // Tạo ví cho user mới
    await pool.request()
      .input('userId', sql.Int, result.recordset[0].id)
      .query('INSERT INTO Wallets (userId, balance) VALUES (@userId, 0)');

    res.json({
      success: true,
      message: 'Thêm người dùng thành công',
      data: result.recordset[0]
    });

  } catch (err) {
    console.error('Lỗi thêm user:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Cập nhật thông tin người dùng
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, role, isActive } = req.body;

    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('email', sql.VarChar, email)
      .input('phoneNumber', sql.VarChar, phoneNumber)
      .input('role', sql.VarChar, role)
      .input('isActive', sql.Bit, isActive)
      .query(`
        UPDATE Users 
        SET name = @name,
            email = @email,
            phoneNumber = @phoneNumber,
            role = @role,
            isActive = @isActive,
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: result.recordset[0]
    });

  } catch (err) {
    console.error('Lỗi cập nhật user:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Xóa người dùng (hoặc vô hiệu hóa)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;
    
    // Kiểm tra user có tồn tại không
    const checkUser = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM Users WHERE id = @id');
    
    if (checkUser.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }

    // Xóa user (hoặc set isActive = 0)
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Users SET isActive = 0 WHERE id = @id');

    res.json({
      success: true,
      message: 'Vô hiệu hóa người dùng thành công'
    });

  } catch (err) {
    console.error('Lỗi xóa user:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});
// routes/admin.routes.js - Sửa route lấy danh sách nhà xe

// Lấy danh sách nhà xe
router.get('/companies', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        pc.id,
        pc.name,
        pc.phone,
        pc.email,
        pc.address,
        pc.taxCode,
        pc.logo,
        pc.isActive,
        pc.verifiedAt,
        pc.createdAt,
        u.id as userId,
        w.balance,
        w.currency,
        (SELECT COUNT(*) FROM Vehicles v WHERE v.partnerId = u.id) as totalVehicles,
        (SELECT COUNT(*) FROM Trips t 
         JOIN Vehicles v ON t.vehicleId = v.id 
         WHERE v.partnerId = u.id AND t.isActive = 1) as totalTrips
      FROM PassengerCarCompanies pc
      LEFT JOIN Users u ON pc.email = u.email
      LEFT JOIN Wallets w ON u.id = w.userId
      ORDER BY pc.createdAt DESC
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách nhà xe:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Lấy chi tiết nhà xe theo ID
router.get('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          pc.*,
          u.id as userId,
          w.balance,
          w.currency,
          (SELECT COUNT(*) FROM Vehicles WHERE partnerId = u.id) as totalVehicles,
          (SELECT COUNT(*) FROM Trips t 
           JOIN Vehicles v ON t.vehicleId = v.id 
           WHERE v.partnerId = u.id) as totalTrips
        FROM PassengerCarCompanies pc
        LEFT JOIN Users u ON pc.email = u.email
        LEFT JOIN Wallets w ON u.id = w.userId
        WHERE pc.id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhà xe'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (err) {
    console.error('Lỗi lấy chi tiết nhà xe:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});
// routes/admin.routes.js - API quản lý vé

// Lấy danh sách vé
router.get('/tickets', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        tk.id,
        u.id as userId,
        u.name as customerName,
        u.email as customerEmail,
        u.phoneNumber as customerPhone,
        sFrom.name as fromStation,
        sFrom.id as fromStationId,
        sTo.name as toStation,
        sTo.id as toStationId,
        tr.id as tripId,
        tr.startTime,
        tr.price as tripPrice,
        tk.totalAmount,
        tk.status,
        tk.paymentMethod,
        tk.transactionId,
        tk.bookedAt,
        s.id as seatId,
        s.name as seatName,
        s.floor as seatFloor,
        s.type as seatType,
        v.id as vehicleId,
        v.name as vehicleName,
        pc.id as companyId,
        pc.name as companyName,
        tp.fullName as passengerName,
        tp.phoneNumber as passengerPhone,
        tp.email as passengerEmail,
        t.amount as transactionAmount,
        t.type as transactionType
      FROM Tickets tk
      LEFT JOIN Users u ON tk.userId = u.id
      LEFT JOIN Trips tr ON tk.tripId = tr.id
      LEFT JOIN Stations sFrom ON tr.fromStationId = sFrom.id
      LEFT JOIN Stations sTo ON tr.toStationId = sTo.id
      LEFT JOIN Seats s ON tk.seatId = s.id
      LEFT JOIN Vehicles v ON tr.vehicleId = v.id
      LEFT JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
      LEFT JOIN TicketPassengers tp ON tk.id = tp.ticketId
      LEFT JOIN Transactions t ON tk.transactionId = t.id
      ORDER BY tk.bookedAt DESC
    `);
    
    console.log(`✅ Tìm thấy ${result.recordset.length} vé`);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách vé:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Lấy thống kê vé
router.get('/tickets/status', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as totalTickets,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paidTickets,
        SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END) as bookedTickets,
        SUM(CASE WHEN status = 'USED' THEN 1 ELSE 0 END) as usedTickets,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledTickets,
        ISNULL(SUM(CASE WHEN status IN ('PAID', 'USED') THEN totalAmount ELSE 0 END), 0) as totalRevenue
      FROM Tickets
    `);
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (err) {
    console.error('❌ Lỗi lấy thống kê:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Cập nhật trạng thái vé
router.patch('/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['BOOKED', 'PAID', 'CANCELLED', 'USED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Trạng thái không hợp lệ'
      });
    }

    const pool = await poolPromise;
    
    // Kiểm tra vé tồn tại
    const checkTicket = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id, seatId FROM Tickets WHERE id = @id');
    
    if (checkTicket.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy vé'
      });
    }

    // Cập nhật trạng thái
    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, status)
      .query('UPDATE Tickets SET status = @status WHERE id = @id');
    
    // Nếu hủy vé, cập nhật trạng thái ghế
    if (status === 'CANCELLED') {
      const seatId = checkTicket.recordset[0].seatId;
      if (seatId) {
        await pool.request()
          .input('seatId', sql.Int, seatId)
          .query("UPDATE Seats SET status = 'AVAILABLE' WHERE id = @seatId");
      }
    }
    
    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công'
    });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Xóa vé
router.delete('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await poolPromise;
    
    // Kiểm tra vé tồn tại
    const checkTicket = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id, seatId FROM Tickets WHERE id = @id');
    
    if (checkTicket.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy vé'
      });
    }

    // Cập nhật trạng thái ghế về AVAILABLE
    const seatId = checkTicket.recordset[0].seatId;
    if (seatId) {
      await pool.request()
        .input('seatId', sql.Int, seatId)
        .query("UPDATE Seats SET status = 'AVAILABLE' WHERE id = @seatId");
    }

    // Xóa passenger trước
    await pool.request()
      .input('ticketId', sql.Int, id)
      .query('DELETE FROM TicketPassengers WHERE ticketId = @ticketId');
    
    // Xóa vé
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Tickets WHERE id = @id');
    
    res.json({
      success: true,
      message: 'Xóa vé thành công'
    });
  } catch (err) {
    console.error('❌ Lỗi xóa vé:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Debug: Lấy tất cả tickets không JOIN
router.get('/tickets-raw', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        id,
        userId,
        tripId,
        seatId,
        totalAmount,
        status,
        paymentMethod,
        transactionId,
        bookedAt
      FROM Tickets
      ORDER BY id
    `);
    
    console.log('🔍 Tickets raw:', result.recordset.length);
    
    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('❌ Lỗi tickets-raw:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});
module.exports = router;