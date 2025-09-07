#!/usr/bin/env node 

// Test database connection script
require('./dotenv.config');
const mysql = require('mysql2');

console.log('🔍 Testing Database Connection...\n');

// Display environment variables (without sensitive data)
console.log('📋 Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || '3306 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('');

// Test DNS resolution
const dns = require('dns');
const hostname = process.env.DB_HOST;

if (hostname) {
  console.log('🌐 Testing DNS resolution for:', hostname);
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error('❌ DNS resolution failed:', err.message);
    } else {
      console.log('✅ DNS resolution successful:');
      console.log('   Address:', address);
      console.log('   Family:', family);
    }
    
    // Test database connection after DNS check
    testDatabaseConnection();
  });
} else {
  console.log('❌ DB_HOST environment variable not set');
  process.exit(1);
}

function testDatabaseConnection() {
  console.log('\n🗄️ Testing Database Connection...');
  
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
    connectTimeout: 10000
  });

  connection.connect((err) => {
    if (err) {
      console.error('❌ Database connection failed:');
      console.error('   Error Code:', err.code);
      console.error('   Error Message:', err.message);
      console.error('   SQL State:', err.sqlState);
      
      // Provide specific troubleshooting advice based on error
      switch (err.code) {
        case 'ENOTFOUND':
          console.log('\n💡 Troubleshooting: DNS resolution failed');
          console.log('   - Check if the hostname is correct');
          console.log('   - Verify internet connectivity');
          console.log('   - Check if Clever Cloud service is running');
          break;
        case 'ECONNREFUSED':
          console.log('\n💡 Troubleshooting: Connection refused');
          console.log('   - Check if MySQL service is running on Clever Cloud');
          console.log('   - Verify the port number is correct');
          console.log('   - Check if external connections are allowed');
          break;
        case 'ETIMEDOUT':
          console.log('\n💡 Troubleshooting: Connection timeout');
          console.log('   - Check network connectivity');
          console.log('   - Verify firewall settings');
          console.log('   - Check if Clever Cloud allows connections from your IP');
          break;
        case 'ER_ACCESS_DENIED_ERROR':
          console.log('\n💡 Troubleshooting: Access denied');
          console.log('   - Verify username and password');
          console.log('   - Check if user has access to the database');
          console.log('   - Verify database name is correct');
          break;
        default:
          console.log('\n💡 Check the error details above for specific issues');
      }
      
      process.exit(1);
    } else {
      console.log('✅ Database connection successful!');
      console.log('   Host:', process.env.DB_HOST);
      console.log('   Database:', process.env.DB_NAME);
      console.log('   User:', process.env.DB_USER);
      
      // Test a simple query
      connection.query('SELECT 1 as test', (err, results) => {
        if (err) {
          console.error('❌ Query test failed:', err.message);
        } else {
          console.log('✅ Query test successful:', results[0]);
        }
        
        connection.end();
        console.log('\n🎉 Database connection test completed successfully!');
        process.exit(0);
      });
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('\n❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Avoid running this script during Jest tests
if (process.env.NODE_ENV === 'test') {
  console.log('Skipping standalone DB test in test environment');
  process.exit(0);
}
