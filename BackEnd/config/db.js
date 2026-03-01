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

const pool = sql.connect(config)
    .then(() => {
        console.log("✅ Connected to SQL Server");
        return sql;
    })
    .catch(err => console.log("❌ DB connection failed:", err));

module.exports = { sql, pool };