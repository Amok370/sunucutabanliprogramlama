// db/mysql_connect.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Bağlantı havuzu oluştur
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // Aynı anda en fazla 10 bağlantı
    queueLimit: 0
});

// Bağlantıyı test et
pool.getConnection()
    .then(connection => {
        console.log('✅ Veritabanı bağlantısı başarılı: ' + process.env.DB_NAME);
        connection.release();
    })
    .catch(err => {
        console.error('❌ Veritabanı bağlantı hatası:', err.message);
    });

module.exports = pool;