const sql = require("mssql");
const dbConfig = require("../config/db");

// ✅ ĐỔI MẬT KHẨU
exports.changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // 1️⃣ Kiểm tra mật khẩu cũ đúng không
    const checkUser = await pool.request()
      .input("id", sql.Int, userId)
      .query("SELECT * FROM Users WHERE id = @id");

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const user = checkUser.recordset[0];

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // 2️⃣ Update mật khẩu mới
    await pool.request()
      .input("id", sql.Int, userId)
      .input("password", sql.VarChar, newPassword)
      .query(`
        UPDATE Users
        SET password = @password,
            updatedAt = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: "Đổi mật khẩu thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};