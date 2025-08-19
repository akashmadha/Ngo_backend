const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false, // Clever Cloud usually works without SSL
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test connection with retry logic
const testConnection = (retries = 3, delay = 2000) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`❌ DB connection failed (attempt ${4 - retries}/3):`, err.message);
      
      if (retries > 1) {
        console.log(`🔄 Retrying in ${delay}ms...`);
        setTimeout(() => testConnection(retries - 1, delay), delay);
      } else {
        console.error("❌ Failed to connect to database after 3 attempts");
        console.log("💡 Check your database credentials and network connection");
      }
    } else {
      console.log("✅ Connected to MySQL database!");
      connection.release();
    }
  });
};

// Initial connection test
testConnection();

module.exports = pool;
