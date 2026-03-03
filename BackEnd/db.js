const sql = require("mssql");

const config = {
  user: "nodeuser",
  password: "123456",
  server: "localhost\\SQLEXPRESS07",
  database: "BUSGO",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

sql.connect(config)
  .then(() => {
    console.log("Connected to SQL Server");
  })
  .catch(err => {
    console.error("Database Connection Failed:", err);
  });

module.exports = sql;