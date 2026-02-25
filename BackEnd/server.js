const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express(); // ⚠️ BẠN ĐANG THIẾU DÒNG NÀY
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cấu hình SQL Server
const config = {
    user: "sa",              // sửa lại user của bạn
    password: "hoangquoc123",      // sửa lại password SQL
    server: "localhost",
    database: "BUSGO",     // sửa lại đúng tên database
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Kết nối database
sql.connect(config)
    .then(() => console.log("✅ Connected to SQL Server"))
    .catch(err => console.log("❌ Database connection failed:", err));

/* ================= LOGIN ================= */
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const request = new sql.Request();
        request.input("email", sql.NVarChar, email);

        const result = await request.query(`
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

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// Chạy server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});