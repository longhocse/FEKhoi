const sql = require("mssql");

const config = {
  user: "sa",
  password: "123456",
  server: "localhost\\SQLEXPRESS2025",
  database: "BUSGO",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 60000,        // Tăng lên 60 giây
    connectionTimeout: 60000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ DB connection failed:", err);
  });

module.exports = {
  sql,
  poolPromise
};