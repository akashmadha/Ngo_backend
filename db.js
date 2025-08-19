import mysql from "mysql2";

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  ssl: {
    rejectUnauthorized: false // Clever Cloud requires SSL
  }
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
  } else {
    console.log("✅ Connected to Clever Cloud MySQL!");
  }
});

export default connection;
