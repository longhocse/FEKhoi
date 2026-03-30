const sql = require("mssql");
const { poolPromise } = require("../config/db");
const sendTicketEmail = require("../utils/sendMail");


// ===============================
// LẤY VÉ CỦA USER
// ===============================
exports.getMyTickets = async (req, res) => {
  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input("userId", sql.Int, req.user.id)
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
          pc.name AS companyName,
          s.name AS seatName
        FROM Tickets tk
        JOIN Trips t ON tk.tripId = t.id
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
        JOIN Seats s ON tk.seatId = s.id
        WHERE tk.userId = @userId
        ORDER BY tk.bookedAt DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {

    console.error("❌ getMyTickets:", error);
    res.status(500).json({ success: false, message: error.message });

  }
};


// ===============================
// LẤY CHI TIẾT VÉ
// ===============================
exports.getTicketById = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT 
          tk.*,
          t.startTime,
          sFrom.name AS fromStation,
          sTo.name AS toStation,
          v.name AS vehicleName,
          pc.name AS companyName,
          s.name AS seatName,
          u.email
        FROM Tickets tk
        JOIN Trips t ON tk.tripId = t.id
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
        JOIN Seats s ON tk.seatId = s.id
        JOIN Users u ON tk.userId = u.id
        WHERE tk.id = @id AND tk.userId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé"
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {

    console.error("❌ getTicketById:", error);
    res.status(500).json({ success: false, message: error.message });

  }

};


// ===============================
// ADMIN LẤY TẤT CẢ VÉ
// ===============================
exports.getAllTickets = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        tk.id,
        u.name as userName,
        u.email as userEmail,
        tp.fullName as passengerName,
        s.name as seatName,
        fs.name as fromStation,
        ts.name as toStation,
        tr.startTime,
        v.name as vehicleName,
        pc.name as companyName,
        tk.status,
        tk.paymentMethod,
        tk.totalAmount,
        tk.bookedAt
      FROM Tickets tk
      LEFT JOIN Users u ON tk.userId = u.id
      LEFT JOIN TicketPassengers tp ON tk.id = tp.ticketId
      JOIN Trips tr ON tk.tripId = tr.id
      JOIN Stations fs ON tr.fromStationId = fs.id
      JOIN Stations ts ON tr.toStationId = ts.id
      JOIN Vehicles v ON tr.vehicleId = v.id
      JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
      JOIN Seats s ON tk.seatId = s.id
      ORDER BY tk.bookedAt DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {

    console.error("❌ getAllTickets:", error);
    res.status(500).json({ success: false, message: error.message });

  }

};


// ===============================
// CẬP NHẬT TRẠNG THÁI VÉ
// ===============================
exports.updateTicketStatus = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("status", sql.VarChar, req.body.status)
      .query(`
        UPDATE Tickets
        SET status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {

    console.error("❌ updateTicketStatus:", error);
    res.status(500).json({ success: false, message: error.message });

  }

};


// ===============================
// HỦY VÉ
// ===============================
exports.cancelTicket = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT tk.id, tk.seatId, tr.startTime, u.email
        FROM Tickets tk
        JOIN Trips tr ON tk.tripId = tr.id
        JOIN Users u ON tk.userId = u.id
        WHERE tk.id = @id AND tk.userId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé"
      });
    }

    const ticket = result.recordset[0];

    await pool.request()
      .input("id", sql.Int, ticket.id)
      .query(`
        UPDATE Tickets
        SET status = 'CANCELLED'
        WHERE id = @id
      `);

    await pool.request()
      .input("seatId", sql.Int, ticket.seatId)
      .query(`
        UPDATE Seats
        SET status = 'AVAILABLE'
        WHERE id = @seatId
      `);

    res.json({
      success: true,
      message: "Hủy vé thành công"
    });

  } catch (error) {

    console.error("❌ cancelTicket:", error);
    res.status(500).json({ success: false, message: error.message });

  }

};

// ===============================
// GỬI MAIL XÁC NHẨN VÉ
// ===============================
exports.sendTicketConfirmation = async (ticketId) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .query(`
        SELECT 
          t.id,
          u.name as userName,
          u.email,
          u.phoneNumber,
          sFrom.name as fromStation,
          sTo.name as toStation,
          tr.startTime,
          se.name as seatName,
          v.licensePlate,
          t.totalAmount,
          partner.name as companyName,      -- ✅ Tên nhà xe (từ Users role='partner')
          partner.phoneNumber as companyPhone  -- ✅ SĐT nhà xe
        FROM Tickets t
        JOIN Users u ON t.userId = u.id
        JOIN Trips tr ON t.tripId = tr.id
        JOIN Stations sFrom ON tr.fromStationId = sFrom.id
        JOIN Stations sTo ON tr.toStationId = sTo.id
        JOIN Seats se ON t.seatId = se.id
        JOIN Vehicles v ON tr.vehicleId = v.id
        JOIN Users partner ON v.partnerId = partner.id   -- ✅ JOIN với Users để lấy thông tin nhà xe (partner)
        WHERE t.id = @ticketId
      `);

    if (result.recordset.length === 0) return;

    const ticket = result.recordset[0];

    await sendTicketEmail(ticket.email, {
      ticketId: ticket.id,
      route: `${ticket.fromStation} - ${ticket.toStation}`,
      date: new Date(ticket.startTime).toLocaleDateString(),
      time: new Date(ticket.startTime).toLocaleTimeString(),
      seat: ticket.seatName,
      vehicle: ticket.licensePlate,
      price: ticket.totalAmount,
      name: ticket.userName,
      phone: ticket.phoneNumber,
      email: ticket.email,
      companyName: ticket.companyName,      // ✅ Tên nhà xe
      companyPhone: ticket.companyPhone     // ✅ SĐT nhà xe
    });

    console.log("📧 Email vé đã gửi thành công");

  } catch (error) {

    console.error("❌ sendTicketConfirmation:", error);

  }

};