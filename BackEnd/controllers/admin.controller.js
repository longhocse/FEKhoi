const { sql, poolPromise } = require("../config/db");

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const pool = await poolPromise;

    const totalUsers = await pool.request()
      .query("SELECT COUNT(*) as count FROM Users WHERE role = 'customer'");

    const totalPartners = await pool.request()
      .query("SELECT COUNT(*) as count FROM Users WHERE role = 'partner'");

    const totalTrips = await pool.request()
      .query("SELECT COUNT(*) as count FROM Trips WHERE isActive = 1");

    const totalRevenue = await pool.request()
      .query("SELECT ISNULL(SUM(totalAmount),0) as total FROM Tickets WHERE status IN ('PAID','USED')");

    const totalTickets = await pool.request()
      .query("SELECT COUNT(*) as count FROM Tickets WHERE status IN ('PAID','USED')");

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
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getUpcomingTrips = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 5
        t.id,
        sFrom.name AS fromStation,
        sTo.name AS toStation,
        t.startTime,
        t.price
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      WHERE t.startTime > GETDATE()
      AND t.isActive = 1
      ORDER BY t.startTime ASC
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ================= USERS =================

exports.getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        u.id,u.name,u.email,u.phoneNumber,u.role,u.isActive,
        u.createdAt,u.updatedAt,
        w.balance,w.currency
      FROM Users u
      LEFT JOIN Wallets w ON u.id = w.userId
      ORDER BY u.createdAt DESC
    `);

    res.json({ success: true, data: result.recordset });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.createUser = async (req, res) => {
  try {

    const { name, email, phoneNumber, password, role } = req.body;

    if (!name || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const pool = await poolPromise;

    const checkEmail = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM Users WHERE email=@email");

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      });
    }

    const result = await pool.request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.VarChar, email)
      .input("phoneNumber", sql.VarChar, phoneNumber)
      .input("password", sql.VarChar, password)
      .input("role", sql.VarChar, role)
      .input("isActive", sql.Bit, 1)
      .query(`
        INSERT INTO Users(name,email,phoneNumber,password,role,isActive)
        OUTPUT INSERTED.*
        VALUES(@name,@email,@phoneNumber,@password,@role,@isActive)
      `);

    await pool.request()
      .input("userId", sql.Int, result.recordset[0].id)
      .query("INSERT INTO Wallets(userId,balance) VALUES(@userId,0)");

    res.json({
      success: true,
      message: "User created",
      data: result.recordset[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.updateUser = async (req, res) => {

  try {

    const { id } = req.params;
    const { name, email, phoneNumber, role, isActive } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("email", sql.VarChar, email)
      .input("phoneNumber", sql.VarChar, phoneNumber)
      .input("role", sql.VarChar, role)
      .input("isActive", sql.Bit, isActive)
      .query(`
        UPDATE Users
        SET name=@name,
            email=@email,
            phoneNumber=@phoneNumber,
            role=@role,
            isActive=@isActive,
            updatedAt=GETDATE()
        OUTPUT INSERTED.*
        WHERE id=@id
      `);

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }

};



exports.deleteUser = async (req, res) => {

  try {

    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query("UPDATE Users SET isActive=0 WHERE id=@id");

    res.json({
      success: true,
      message: "User disabled"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }

};



// ================= COMPANIES =================

exports.getCompanies = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT * FROM PassengerCarCompanies
      ORDER BY createdAt DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (err) {

    res.status(500).json({ success: false, error: err.message });

  }

};



exports.getCompanyDetail = async (req, res) => {

  try {

    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT * FROM PassengerCarCompanies
        WHERE id=@id
      `);

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (err) {

    res.status(500).json({ success: false, error: err.message });

  }

};



// ================= TICKETS =================

exports.getTickets = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT * FROM Tickets
      ORDER BY bookedAt DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (err) {

    res.status(500).json({ success: false, error: err.message });

  }

};



exports.getTicketStats = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as totalTickets,
        SUM(CASE WHEN status='PAID' THEN 1 ELSE 0 END) as paidTickets,
        SUM(CASE WHEN status='BOOKED' THEN 1 ELSE 0 END) as bookedTickets,
        SUM(CASE WHEN status='USED' THEN 1 ELSE 0 END) as usedTickets,
        SUM(CASE WHEN status='CANCELLED' THEN 1 ELSE 0 END) as cancelledTickets
      FROM Tickets
    `);

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (err) {

    res.status(500).json({ success: false, error: err.message });

  }

};



exports.updateTicketStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.VarChar, status)
      .query("UPDATE Tickets SET status=@status WHERE id=@id");

    res.json({
      success: true,
      message: "Status updated"
    });

  } catch (err) {

    res.status(500).json({ success: false, error: err.message });

  }

};



exports.deleteTicket = async (req, res) => {

  try {

    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Tickets WHERE id=@id");

    res.json({
      success: true,
      message: "Ticket deleted"
    });

  } catch (err) {

    res.status(500).json({ success: false, error: err.message });

  }

};



exports.getTicketsRaw = async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT * FROM Tickets ORDER BY id
    `);

    res.json({
      success: true,
      data: result.recordset
    });

  } catch (err) {

    res.status(500).json({ success: false, error: err.message });

  }

};