const { sql } = require("../config/db");
const { poolPromise } = require("../config/db");

exports.findByEmail = async (email) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("email", email)
        .query("SELECT * FROM Users WHERE email = @email");

    return result.recordset[0];
};

exports.createUser = async (user) => {
    const pool = await poolPromise;

    await pool.request()
        .input("name", user.name)
        .input("email", user.email)
        .input("phoneNumber", user.phoneNumber)
        .input("password", user.password)
        .input("role", user.role)
        .query(`
            INSERT INTO Users (name, email, phoneNumber, password, role)
            VALUES (@name, @email, @phoneNumber, @password, @role)
        `);
};


/* ================= UPDATE PROFILE ================= */
exports.updateUser = async (id, data) => {
    const pool = await poolPromise;

    await pool.request()
        .input("id", id)
        .input("name", data.name)
        .input("phoneNumber", data.phoneNumber)
        .query(`
            UPDATE Users
            SET name = @name,
                phoneNumber = @phoneNumber,
                updatedAt = GETDATE()
            WHERE id = @id
        `);
};


/* ================= CHANGE PASSWORD (NO BCRYPT) ================= */
exports.changePassword = async (id, currentPassword, newPassword) => {
    const pool = await poolPromise;

    // 1️⃣ Lấy user theo id
    const result = await pool.request()
        .input("id", id)
        .query("SELECT id, password FROM Users WHERE id = @id");

    const user = result.recordset[0];

    if (!user) {
        throw new Error("Không tìm thấy user");
    }


    console.log("Password trong DB:", user.password);
    console.log("So sánh:", user.password === currentPassword);

    // 2️⃣ So sánh mật khẩu cũ
    if (user.password !== currentPassword) {
        throw new Error("Mật khẩu hiện tại không đúng");
    }

    // 3️⃣ Update mật khẩu mới
    await pool.request()
        .input("id", id)
        .input("password", newPassword)
        .query(`
      UPDATE Users
      SET password = @password,
          updatedAt = GETDATE()
      WHERE id = @id
    `);

    console.log("Đã update password thành:", newPassword);
    return true;
};


exports.findById = async (id) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input("id", id)
        .query("SELECT * FROM Users WHERE id = @id");

    return result.recordset[0]; // trả về 1 user
};