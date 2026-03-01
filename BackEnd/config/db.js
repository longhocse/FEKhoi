const sql = require("mssql");

const config = {
  user: "sa",
  password: "1234",
  server: "localhost",
  database: "BUSGO",
  options: {
    encrypt: false,
    trustServerCertificate: true
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