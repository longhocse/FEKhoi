const { poolPromise, sql } = require("../config/db");

/* ================= GET ALL USERS ================= */
exports.getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;

const result = await pool.request().query(`
  SELECT id, name, email, phoneNumber, role, isActive, createdAt
  FROM Users
  ORDER BY id DESC
`);

    res.json(result.recordset);

  } catch (err) {
    console.error("GetUsers error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET USER BY ID ================= */
exports.getUserById = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT * FROM Users WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    console.error("GetUserById error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= CREATE USER ================= */
exports.createUser = async (req, res) => {
  const { name, email, password, role, phoneNumber } = req.body;

  console.log("Create user body:", req.body);

  try {
    const pool = await poolPromise;

    // 🔥 Check email tồn tại
    const emailCheck = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM Users WHERE email = @email");

    if (emailCheck.recordset.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // 🔥 Check phone tồn tại (nếu có nhập)
    if (phoneNumber) {
      const phoneCheck = await pool.request()
        .input("phoneNumber", sql.VarChar, phoneNumber)
        .query("SELECT id FROM Users WHERE phoneNumber = @phoneNumber");

      if (phoneCheck.recordset.length > 0) {
        return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
      }
    }

    // 🔥 Insert
    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, password)
      .input("role", sql.VarChar, role)
      .input("phoneNumber", sql.VarChar, phoneNumber || null)
      .query(`
        INSERT INTO Users (name, email, password, role, phoneNumber, isActive)
        VALUES (@name, @email, @password, @role, @phoneNumber, 1)
      `);

    res.status(201).json({ message: "User created successfully" });

  } catch (err) {
    console.error("CreateUser error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= UPDATE USER ================= */
/* ================= UPDATE USER ================= */
exports.updateUser = async (req, res) => {
  const { name, email, role, phoneNumber } = req.body;

  try {
    const pool = await poolPromise;

    // 🔥 Check email trùng (trừ chính nó)
    const emailCheck = await pool.request()
      .input("email", sql.VarChar, email)
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT id FROM Users 
        WHERE email = @email AND id != @id
      `);

    if (emailCheck.recordset.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // 🔥 Check phone trùng (nếu có nhập)
    if (phoneNumber) {
      const phoneCheck = await pool.request()
        .input("phoneNumber", sql.VarChar, phoneNumber)
        .input("id", sql.Int, req.params.id)
        .query(`
          SELECT id FROM Users 
          WHERE phoneNumber = @phoneNumber AND id != @id
        `);

      if (phoneCheck.recordset.length > 0) {
        return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
      }
    }

    // 🔥 Update
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("name", sql.NVarChar, name)
      .input("email", sql.VarChar, email)
      .input("role", sql.VarChar, role)
      .input("phoneNumber", sql.VarChar, phoneNumber || null)
      .query(`
        UPDATE Users
        SET name = @name,
            email = @email,
            role = @role,
            phoneNumber = @phoneNumber,
            updatedAt = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: "User updated successfully" });

  } catch (err) {
    console.error("UpdateUser error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DELETE USER ================= */
exports.deleteUser = async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        DELETE FROM Users WHERE id = @id
      `);

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error("DeleteUser error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= TOGGLE ACTIVE ================= */
exports.toggleUserStatus = async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        UPDATE Users
        SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END,
            updatedAt = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: "User status updated" });

  } catch (err) {
    console.error("ToggleUserStatus error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};