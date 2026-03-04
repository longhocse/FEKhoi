const { poolPromise } = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const pool = await poolPromise;

    const userResult = await pool.request().query(
      "SELECT COUNT(*) AS totalUsers FROM Users WHERE role = 'customer'"
    );

    const partnerResult = await pool.request().query(
      "SELECT COUNT(*) AS totalPartners FROM Users WHERE role = 'partner'"
    );

    res.json({
      totalUsers: userResult.recordset[0].totalUsers,
      totalPartners: partnerResult.recordset[0].totalPartners
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
/* ================= GET PARTNERS ================= */
exports.getPartners = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT id, name, email, isActive, createdAt
      FROM Users
      WHERE role = 'partner'
      ORDER BY id DESC
    `);

    res.json(result.recordset);

  } catch (error) {
    console.error("Get partners error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getTrips = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        t.id,
        s1.name AS fromStation,
        s2.name AS toStation,
        t.startTime,
        t.price,
        t.isActive,
        u.name AS partnerName
      FROM Trips t
      JOIN Stations s1 ON t.fromStationId = s1.id
      JOIN Stations s2 ON t.toStationId = s2.id
      JOIN Vehicles v ON t.vehicleId = v.id
      JOIN Users u ON v.partnerId = u.id
      ORDER BY t.id DESC
    `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.toggleTripStatus = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    await pool.request()
      .input("id", id)
      .query(`
        UPDATE Trips
        SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END
        WHERE id = @id
      `);

    res.json({ message: "Cập nhật thành công" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};