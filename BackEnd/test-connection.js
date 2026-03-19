// test-connection.js
const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS2025',
    database: process.env.DB_DATABASE || 'BUSGO',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    console.log('🔌 Đang kiểm tra kết nối database...');
    console.log('📊 Cấu hình:', {
        server: config.server,
        database: config.database,
        user: config.user
    });

    try {
        const pool = await sql.connect(config);
        console.log('✅ KẾT NỐI DATABASE THÀNH CÔNG!');

        // Kiểm tra dữ liệu ví
        const result = await pool.request().query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        w.balance,
        w.currency,
        w.isLocked
      FROM Users u
      LEFT JOIN Wallets w ON u.id = w.userId
      ORDER BY u.id
    `);

        console.log('\n📊 DANH SÁCH VÍ:');
        console.log('='.repeat(80));
        result.recordset.forEach(user => {
            console.log(
                `ID: ${user.id.toString().padEnd(3)} | ` +
                `Tên: ${user.name?.padEnd(20)} | ` +
                `Số dư: ${(user.balance || 0).toLocaleString().padEnd(12)} ${user.currency || 'VND'}`
            );
        });

        await sql.close();
    } catch (err) {
        console.error('❌ LỖI KẾT NỐI:', err.message);
        console.error('Chi tiết:', err);
    }
}

testConnection();