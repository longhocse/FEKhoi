const { poolPromise, sql } = require("../config/db");
const jwt = require("jsonwebtoken");


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT id, name, email, password, role, isActive
        FROM Users
        WHERE email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Email không tồn tại" });
    }

    const user = result.recordset[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};