// test-db.js
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

console.log("🔄 Test kết nối SQL Server...");
console.log("Config:", JSON.stringify(config, null, 2));

sql.connect(config)
  .then(pool => {
    console.log("✅ Kết nối thành công!");
    return pool.request().query("SELECT @@VERSION AS version");
  })
  .then(result => {
    console.log("📊 SQL Server version:", result.recordset[0].version);
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  });