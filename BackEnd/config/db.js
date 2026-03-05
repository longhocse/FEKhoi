const sql = require("mssql");

const config = {
  user: "sa",
  password: "123456",
  server: "localhost",
  database: "BUSGO",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

console.log("🔄 Đang kết nối SQL Server...");
console.log(`- Server: ${config.server}`);
console.log(`- Database: ${config.database}`);
console.log(`- User: ${config.user}`);

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Kết nối SQL Server thành công!");
    return pool;
  })
  .catch(err => {
    console.error("❌ Lỗi kết nối SQL:", err);
  });

module.exports = {
  sql,
  poolPromise
};