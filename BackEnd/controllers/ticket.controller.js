const sql = require("mssql");
const { poolPromise } = require("../config/db");
const Ticket = require('../models/ticketModel');

// Lấy vé của user hiện tại
// Lấy vé của user hiện tại
// Lấy vé của user hiện tại
exports.getMyTickets = async (req, res) => {
  try {
    console.log('📌 getMyTickets - userId:', req.user.id);

    const pool = await poolPromise;

    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query(`
            SELECT 
                tk.id,
                tk.totalAmount,
                tk.status,
                tk.paymentMethod,
                tk.bookedAt,
                t.id AS tripId,
                t.startTime,
                sFrom.name AS fromStation,
                sTo.name AS toStation,
                pc.id AS companyId,      -- THÊM DÒNG NÀY
                pc.name AS companyName,  -- THÊM DÒNG NÀY
                s.name AS seatName
            FROM Tickets tk
            JOIN Trips t ON tk.tripId = t.id
            JOIN Stations sFrom ON t.fromStationId = sFrom.id
            JOIN Stations sTo ON t.toStationId = sTo.id
            JOIN Vehicles v ON t.vehicleId = v.id
            JOIN PassengerCarCompanies pc ON v.partnerId = pc.id  -- THÊM JOIN NÀY
            JOIN Seats s ON tk.seatId = s.id
            WHERE tk.userId = @userId
            ORDER BY tk.bookedAt DESC
        `);

    console.log(`✅ Tìm thấy ${result.recordset.length} vé`);
    console.log("📌 Vé đầu tiên:", result.recordset[0]); // Log để kiểm tra

    res.json({
      success: true,
      data: result.recordset
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

// Lấy tất cả vé (admin) - SỬA LẠI HOÀN TOÀN
exports.getAllTickets = async (req, res) => {
  try {
    console.log('📌 getAllTickets - admin called');

    const pool = await poolPromise;
    const { status } = req.query;

    // Sửa lại query với INNER JOIN để đảm bảo lấy đúng dữ liệu
    let query = `
      SELECT 
        tk.id,
        u.name as userName,
        u.email as userEmail,
        u.phoneNumber as userPhone,
        tp.fullName as passengerName,
        tp.phoneNumber as passengerPhone,
        s.name as seatName,
        s.type as seatType,
        s.floor as seatFloor,
        fs.name as fromStation,
        ts.name as toStation,
        tr.startTime,
        tr.price as tripPrice,
        v.name as vehicleName,
        pc.name as companyName,
        tk.status,
        tk.paymentMethod,
        tk.totalAmount,
        tk.bookedAt,
        tk.transactionId,
        tk.note
      FROM Tickets tk
      LEFT JOIN Users u ON tk.userId = u.id
      LEFT JOIN TicketPassengers tp ON tk.id = tp.ticketId
      INNER JOIN Trips tr ON tk.tripId = tr.id
      INNER JOIN Stations fs ON tr.fromStationId = fs.id
      INNER JOIN Stations ts ON tr.toStationId = ts.id
      INNER JOIN Vehicles v ON tr.vehicleId = v.id
      INNER JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
      INNER JOIN Seats s ON tk.seatId = s.id
      WHERE 1=1
    `;

    if (status && status !== 'ALL') {
      query += ` AND tk.status = '${status}'`;
    }

    query += ` ORDER BY tk.bookedAt DESC`;

    console.log('📌 Query:', query);

    const result = await pool.request().query(query);

    console.log(`📌 Tìm thấy ${result.recordset.length} vé`);

    // Log mẫu dữ liệu để debug
    if (result.recordset.length > 0) {
      console.log('📌 Mẫu dữ liệu vé đầu tiên:', {
        id: result.recordset[0].id,
        userName: result.recordset[0].userName,
        fromStation: result.recordset[0].fromStation,
        toStation: result.recordset[0].toStation,
        seatName: result.recordset[0].seatName,
        totalAmount: result.recordset[0].totalAmount,
        status: result.recordset[0].status
      });
    }

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('❌ Lỗi getAllTickets:', error);
    res.status(500).json({
      success: false,
      message: error.message
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