const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  ssl: {
    rejectUnauthorized: false // Clever Cloud requires SSL
  }
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    console.error("Connection details:", {
      host: process.env.DB_HOST || process.env.MYSQLHOST,
      user: process.env.DB_USER || process.env.MYSQLUSER,
      database: process.env.DB_NAME || process.env.MYSQLDATABASE,
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306
    });
  } else {
    console.log("✅ Connected to Clever Cloud MySQL!");
    console.log("Database:", process.env.DB_NAME || process.env.MYSQLDATABASE);
    console.log("Host:", process.env.DB_HOST || process.env.MYSQLHOST);
  }
});

module.exports = connection;
