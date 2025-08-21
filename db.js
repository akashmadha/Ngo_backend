const mysql = require("mysql2");
require("./dotenv.config");

// Create connection pool instead of single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }  // ✅ Required for Clever Cloud
});

// Test the pool connection with retry logic
const testConnection = (retryCount = 0, maxRetries = 3) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`❌ MySQL pool connection error (attempt ${retryCount + 1}/${maxRetries}):`, err.message);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying connection in 5 seconds... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => testConnection(retryCount + 1, maxRetries), 5000);
      } else {
        console.error("❌ Failed to connect after maximum retries");
        console.error("Connection details:", {
          host: process.env.DB_HOST || process.env.MYSQLHOST,
          user: process.env.DB_USER || process.env.MYSQLUSER,
          database: process.env.DB_NAME || process.env.MYSQLDATABASE,
          port: process.env.DB_PORT || process.env.MYSQLPORT || 3306
        });
        
        // Log environment variables for debugging (without sensitive data)
        console.log("🔍 Environment check:");
        console.log("DB_HOST:", process.env.DB_HOST ? "SET" : "NOT SET");
        console.log("DB_USER:", process.env.DB_USER ? "SET" : "NOT SET");
        console.log("DB_NAME:", process.env.DB_NAME ? "SET" : "NOT SET");
        console.log("DB_PORT:", process.env.DB_PORT || process.env.MYSQLPORT || 3306);
      }
    } else {
      console.log("✅ Connected to Clever Cloud MySQL Pool!");
      console.log("Database:", process.env.DB_NAME || process.env.MYSQLDATABASE);
      console.log("Host:", process.env.DB_HOST || process.env.MYSQLHOST);
      connection.release(); // Release the test connection back to pool
    }
  });
};

// Initial connection test
testConnection();

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ MySQL Pool Error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Database connection was closed. Reconnecting...');
  }
});

module.exports = pool;
