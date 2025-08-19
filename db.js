const mysql = require("mysql2");
require("dotenv").config();

// Create connection pool instead of single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  ssl: {
    rejectUnauthorized: false // Clever Cloud requires SSL
  },
  // Pool configuration
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  waitForConnections: true,
  queueLimit: 0
});

// Test the pool connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL pool connection error:", err);
    console.error("Connection details:", {
      host: process.env.DB_HOST || process.env.MYSQLHOST,
      user: process.env.DB_USER || process.env.MYSQLUSER,
      database: process.env.DB_NAME || process.env.MYSQLDATABASE,
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306
    });
  } else {
    console.log("✅ Connected to Clever Cloud MySQL Pool!");
    console.log("Database:", process.env.DB_NAME || process.env.MYSQLDATABASE);
    console.log("Host:", process.env.DB_HOST || process.env.MYSQLHOST);
    connection.release(); // Release the test connection back to pool
  }
});

module.exports = pool;
