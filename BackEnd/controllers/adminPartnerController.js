const { poolPromise } = require("../config/db");

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};