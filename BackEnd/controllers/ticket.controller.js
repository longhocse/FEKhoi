const sql = require("mssql");
const { poolPromise } = require("../config/db");
const Ticket = require('../models/ticketModel');

// Lấy vé của user hiện tại
exports.getMyTickets = async (req, res) => {
  try {
    console.log('📌 getMyTickets - userId:', req.user.id);

    const tickets = await Ticket.getByUserId(req.user.id);

    console.log(`✅ Tìm thấy ${tickets.length} vé`);

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('❌ Lỗi getMyTickets:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy chi tiết vé theo ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`📌 getTicketById - id: ${id}, userId: ${userId}`);

    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          tk.*,
          t.startTime,
          sFrom.name AS fromStation,
          sTo.name AS toStation,
          v.name AS vehicleName,
          pc.name AS companyName,
          s.name AS seatName
        FROM Tickets tk
        JOIN Trips t ON tk.tripId = t.id
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
        JOIN Seats s ON tk.seatId = s.id
        WHERE tk.id = @id AND tk.userId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vé'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('❌ Lỗi getTicketById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy tất cả vé (admin)
exports.getAllTickets = async (req, res) => {
  try {
    console.log('📌 getAllTickets - admin');

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        t.id,
        u.name AS customerName,
        tp.fullName AS passengerName,
        s.name AS seatName,
        fs.name AS fromStation,
        ts.name AS toStation,
        tr.startTime,
        v.name AS vehicleName,
        t.status,
        t.paymentMethod,
        t.totalAmount,
        t.bookedAt
      FROM Tickets t
      LEFT JOIN Users u ON t.userId = u.id
      LEFT JOIN Trips tr ON t.tripId = tr.id
      LEFT JOIN Stations fs ON tr.fromStationId = fs.id
      LEFT JOIN Stations ts ON tr.toStationId = ts.id
      LEFT JOIN Vehicles v ON tr.vehicleId = v.id
      LEFT JOIN Seats s ON t.seatId = s.id
      LEFT JOIN TicketPassengers tp ON tp.ticketId = t.id
      ORDER BY t.bookedAt DESC
    `);

    console.log(`✅ Tìm thấy ${result.recordset.length} vé`);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    console.error('❌ Lỗi getAllTickets:', err);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// Cập nhật trạng thái vé
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`📌 updateTicketStatus - id: ${id}, status: ${status}`);

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.VarChar, status)
      .query(`
        UPDATE Tickets
        SET status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé"
      });
    }

    console.log('✅ Cập nhật thành công:', result.recordset[0]);

    res.json({
      success: true,
      message: "Cập nhật thành công",
      data: result.recordset[0]
    });
  } catch (err) {
    console.error('❌ Lỗi updateTicketStatus:', err);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// Hủy vé (user tự hủy)
exports.cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`📌 cancelTicket - id: ${id}, userId: ${userId}`);

    const pool = await poolPromise;

    // Kiểm tra vé có thuộc về user không
    const checkResult = await pool.request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, userId)
      .query(`
        SELECT t.*, tr.startTime 
        FROM Tickets t
        JOIN Trips tr ON t.tripId = tr.id
        WHERE t.id = @id AND t.userId = @userId
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé hoặc bạn không có quyền hủy"
      });
    }

    const ticket = checkResult.recordset[0];

    // Chỉ cho hủy vé ở trạng thái BOOKED
    if (ticket.status !== 'BOOKED') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy vé ở trạng thái chờ thanh toán"
      });
    }

    // Cập nhật trạng thái vé
    await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.VarChar, 'CANCELLED')
      .query(`
        UPDATE Tickets 
        SET status = @status 
        WHERE id = @id
      `);

    // NHẢ GHẾ - Cập nhật trạng thái ghế thành AVAILABLE
    await pool.request()
      .input("seatId", sql.Int, ticket.seatId)
      .query(`
        UPDATE Seats 
        SET status = 'AVAILABLE' 
        WHERE id = @seatId
      `);

    console.log('✅ Hủy vé thành công, ghế đã được nhả');

    res.json({
      success: true,
      message: "Hủy vé thành công"
    });

  } catch (err) {
    console.error('❌ Lỗi cancelTicket:', err);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};