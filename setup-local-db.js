#!/usr/bin/env node

// Setup script for local MySQL development
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Local MySQL Connection for Development...\n');

// Check if MySQL is running locally
console.log('🌐 Testing local MySQL connection...');

const localConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  connectTimeout: 5000
});

localConnection.connect((err) => {
  if (err) {
    console.log('❌ Local MySQL is not running or not accessible');
    console.log('   Error:', err.message);
    console.log('\n💡 To fix this:');
    console.log('   1. Install MySQL Server locally');
    console.log('   2. Start MySQL service');
    console.log('   3. Create a database called "ngolinkup"');
    console.log('   4. Or use XAMPP/WAMP for easy setup');
  } else {
    console.log('✅ Local MySQL is running!');
    
    // Test if database exists
    localConnection.query('SHOW DATABASES LIKE "ngolinkup"', (err, results) => {
      if (err) {
        console.log('❌ Error checking database:', err.message);
      } else if (results.length === 0) {
        console.log('⚠️ Database "ngolinkup" does not exist');
        console.log('💡 Creating database...');
        
        localConnection.query('CREATE DATABASE IF NOT EXISTS ngolinkup', (err) => {
          if (err) {
            console.log('❌ Error creating database:', err.message);
          } else {
            console.log('✅ Database "ngolinkup" created successfully!');
            console.log('\n🎯 Your local MySQL is ready for development!');
            console.log('   Host: localhost');
            console.log('   User: root');
            console.log('   Database: ngolinkup');
            console.log('   Password: (empty)');
          }
          localConnection.end();
        });
      } else {
        console.log('✅ Database "ngolinkup" exists!');
        console.log('\n🎯 Your local MySQL is ready for development!');
        localConnection.end();
      }
    });
  }
});

console.log('\n📋 Next Steps:');
console.log('1. Check Clever Cloud dashboard for MySQL service status');
console.log('2. If service is down, consider using Railway or local MySQL');
console.log('3. Update your .env file with the correct database details');
console.log('4. Test the connection again');

