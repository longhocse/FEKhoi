const sql = require("mssql");

// Cấu hình kết nối
const config = {
    user: "sa",
    password: "hoangquoc123",
    server: "localhost",
    port: 1433,
    database: "BUSGO",
    options: {
        encrypt: false,              // vì đang chạy local
        trustServerCertificate: true // tránh lỗi SSL
    }
};

// Tạo pool connection dùng chung
let pool;

// Hàm kết nối database
const connectDB = async () => {
    try {
        pool = await sql.connect(config);
        console.log("✅ Connected to SQL Server");
        return pool;
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1); // dừng server nếu DB lỗi
    }
};

// Export ra để dùng ở file khác
module.exports = {
    sql,
    connectDB,
    getPool: () => pool
};