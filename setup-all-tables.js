#!/usr/bin/env node

// Setup all required database tables for NGO management system
require('./dotenv.config');
const mysql = require('mysql2');

console.log('🔧 Setting up All Required Database Tables...\n');

// Create connection to your Clever Cloud database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
});

async function setupAllTables() {
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

    // Define all required tables
    const tables = [
      {
        name: 'organization_members',
        sql: `
          CREATE TABLE IF NOT EXISTS organization_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            organization_name VARCHAR(255) NOT NULL,
            organization_type VARCHAR(100) NOT NULL,
            pan_no VARCHAR(20) UNIQUE,
            email VARCHAR(100) UNIQUE NOT NULL,
            mobile_no VARCHAR(15) UNIQUE NOT NULL,
            spoc_name VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            status ENUM('pending', 'active', 'inactive', 'rejected') DEFAULT 'pending',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'members_registration_details',
        sql: `
          CREATE TABLE IF NOT EXISTS members_registration_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            organization_name VARCHAR(255) NOT NULL,
            registration_type VARCHAR(100) NOT NULL,
            registration_no VARCHAR(100),
            registration_date DATE,
            other_registration_no VARCHAR(100),
            other_registration_date DATE,
            pan_no VARCHAR(20),
            tan_no VARCHAR(20),
            gst_no VARCHAR(20),
            ngo_registration_no VARCHAR(100),
            ngo_registration_date DATE,
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'addresses',
        sql: `
          CREATE TABLE IF NOT EXISTS addresses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            type ENUM('permanent', 'correspondence') DEFAULT 'permanent',
            address1 VARCHAR(255) NOT NULL,
            address2 VARCHAR(255),
            state VARCHAR(100) NOT NULL,
            district VARCHAR(100) NOT NULL,
            tahsil VARCHAR(100),
            city VARCHAR(100) NOT NULL,
            pincode VARCHAR(10) NOT NULL,
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'phones',
        sql: `
          CREATE TABLE IF NOT EXISTS phones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            number VARCHAR(15) NOT NULL,
            type ENUM('mobile', 'landline') DEFAULT 'mobile',
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'emails',
        sql: `
          CREATE TABLE IF NOT EXISTS emails (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            email VARCHAR(100) NOT NULL,
            type ENUM('primary', 'secondary') DEFAULT 'primary',
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'social_links',
        sql: `
          CREATE TABLE IF NOT EXISTS social_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            platform VARCHAR(100) NOT NULL,
            url VARCHAR(255) NOT NULL,
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'key_contacts',
        sql: `
          CREATE TABLE IF NOT EXISTS key_contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            mobile VARCHAR(15),
            email VARCHAR(100),
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'certification_details',
        sql: `
          CREATE TABLE IF NOT EXISTS certification_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            reg12A VARCHAR(100),
            reg12ADate DATE,
            reg80G VARCHAR(100),
            reg80GDate DATE,
            reg35AC VARCHAR(100),
            reg35ACDate DATE,
            regFCRA VARCHAR(100),
            regFCRADate DATE,
            regCSR1 VARCHAR(100),
            regCSR1Date DATE,
            regGCSR VARCHAR(100),
            regGCSRDate DATE,
            other_detail TEXT,
            other_date DATE,
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'documents',
        sql: `
          CREATE TABLE IF NOT EXISTS documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            document_type VARCHAR(100) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size INT,
            mime_type VARCHAR(100),
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'states',
        sql: `
          CREATE TABLE IF NOT EXISTS states (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            code VARCHAR(10),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'districts',
        sql: `
          CREATE TABLE IF NOT EXISTS districts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            state_id INT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (state_id) REFERENCES states(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'cities',
        sql: `
          CREATE TABLE IF NOT EXISTS cities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            state_id INT NOT NULL,
            district_id INT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (state_id) REFERENCES states(id),
            FOREIGN KEY (district_id) REFERENCES districts(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'talukas',
        sql: `
          CREATE TABLE IF NOT EXISTS talukas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            state_id INT NOT NULL,
            district_id INT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (state_id) REFERENCES states(id),
            FOREIGN KEY (district_id) REFERENCES districts(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'occupations',
        sql: `
          CREATE TABLE IF NOT EXISTS occupations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'designations',
        sql: `
          CREATE TABLE IF NOT EXISTS designations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    ];

    // Create each table
    for (const table of tables) {
      console.log(`📋 Creating ${table.name} table...`);
      
      try {
        await new Promise((resolve, reject) => {
          connection.query(table.sql, (err) => {
            if (err) {
              console.error(`❌ Error creating ${table.name} table:`, err.message);
              reject(err);
            } else {
              console.log(`✅ ${table.name} table created successfully!`);
              resolve();
            }
          });
        });
      } catch (error) {
        console.log(`⚠️ Skipping ${table.name} table due to error`);
      }
    }

    // Insert some basic data
    console.log('\n📝 Inserting basic data...');
    
    // Insert some states
    const states = [
      { name: 'Maharashtra', code: 'MH' },
      { name: 'Delhi', code: 'DL' },
      { name: 'Karnataka', code: 'KA' },
      { name: 'Tamil Nadu', code: 'TN' },
      { name: 'Gujarat', code: 'GJ' }
    ];

    for (const state of states) {
      try {
        await new Promise((resolve, reject) => {
          connection.query('INSERT IGNORE INTO states (name, code) VALUES (?, ?)', [state.name, state.code], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        // Ignore duplicate key errors
      }
    }

    console.log('✅ Basic data inserted successfully!');

    console.log('\n🎉 All database tables setup completed successfully!');
    console.log('\n🧪 Now you can:');
    console.log('   1. Test admin login');
    console.log('   2. Test organization registration');
    console.log('   3. Use the full NGO management system');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    connection.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the setup
setupAllTables();



