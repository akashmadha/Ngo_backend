#!/usr/bin/env node

// Setup admin table and admin user
require('./dotenv.config');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

console.log('🔧 Setting up Admin Table and Admin User...\n');

// Create connection to your Clever Cloud database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
});

async function setupAdmin() {
  try {
    // Connect to database
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to database successfully!');
          resolve();
        }
      });
    });

    // Create admins table
    console.log('\n📋 Creating admins table...');
    const createAdminsTable = `
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await new Promise((resolve, reject) => {
      connection.query(createAdminsTable, (err) => {
        if (err) {
          console.error('❌ Error creating admins table:', err.message);
          reject(err);
        } else {
          console.log('✅ Admins table created successfully!');
          resolve();
        }
      });
    });

    // Check if admin user already exists
    console.log('\n🔍 Checking if admin user exists...');
    const checkAdmin = await new Promise((resolve, reject) => {
      connection.query('SELECT id FROM admins WHERE email = ?', ['admin@ngolinkup.com'], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (checkAdmin.length > 0) {
      console.log('✅ Admin user already exists!');
    } else {
      // Create admin user
      console.log('\n👤 Creating admin user...');
      const adminPassword = 'admin123'; // Change this to a secure password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const insertAdmin = `
        INSERT INTO admins (username, email, password_hash, full_name, role) 
        VALUES (?, ?, ?, ?, ?)
      `;

      await new Promise((resolve, reject) => {
        connection.query(insertAdmin, ['admin', 'admin@ngolinkup.com', hashedPassword, 'System Administrator', 'admin'], (err) => {
          if (err) {
            console.error('❌ Error creating admin user:', err.message);
            reject(err);
          } else {
            console.log('✅ Admin user created successfully!');
            resolve();
          }
        });
      });

      console.log('\n🔑 Admin Login Credentials:');
      console.log('   Username: admin');
      console.log('   Email: admin@ngolinkup.com');
      console.log('   Password: admin123');
      console.log('   ⚠️  Change this password in production!');
    }

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n🧪 Test admin login:');
    console.log('   POST /api/login');
    console.log('   Body: { "username": "admin", "password": "admin123", "userType": "admin" }');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    connection.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the setup
setupAdmin();

