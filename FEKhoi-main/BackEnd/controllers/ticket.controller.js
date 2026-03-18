const sql = require("mssql");
const dbConfig = require("../config/db");

exports.getAllTickets = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

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

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// ✅ THÊM PHẦN NÀY
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.VarChar, status)
      .query(`
        UPDATE Tickets
        SET status = @status
        WHERE id = @id
      `);

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};