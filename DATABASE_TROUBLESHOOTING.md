# Database Connection Troubleshooting Guide

## Issues Identified and Fixed

### 1. Invalid MySQL2 Configuration Options
**Problem**: The following options are not valid for MySQL2 and were causing warnings:
- `acquireTimeout` (not a valid MySQL2 option)
- `timeout` (not a valid MySQL2 option) 
- `reconnect` (not a valid MySQL2 option)

**Solution**: Removed invalid options and replaced with proper MySQL2 configuration:
```javascript
// Before (Invalid)
{
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
}

// After (Valid)
{
  acquireTimeout: 60000, // Time to acquire connection from pool
  timeout: 60000, // Query timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
}
```

### 2. Environment Variable Loading Warning
**Problem**: Dotenv warning about loading multiple .env files
**Solution**: Created `dotenv.config.js` to properly handle multiple .env files with priority:
- `.env.local` (highest priority)
- `.env.production`
- `.env` (lowest priority)

### 3. Database Connection Failure
**Problem**: `ENOTFOUND` error for Clever Cloud MySQL hostname
**Solutions Implemented**:
- Added retry logic with exponential backoff
- Better error logging and debugging information
- Connection pool error handling
- Environment variable validation

## Configuration Files

### Required Environment Variables
```bash
DB_HOST=b7xrntk1gf8hqke2yyxb-mysql.services.clever-cloud.com
DB_USER=uiaikaycfxjdsxng
DB_PASSWORD=your_actual_password
DB_NAME=b7xrntk1gf8hqke2yyxb
DB_PORT=3306
```

### Database Connection Pool Settings
```javascript
{
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false },
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
}
```

## Troubleshooting Steps

### 1. Check Environment Variables
```bash
# Verify all required variables are set
echo $DB_HOST
echo $DB_USER
echo $DB_NAME
echo $DB_PORT
```

### 2. Test Database Connectivity
```bash
# Test if hostname resolves
nslookup b7xrntk1gf8hqke2yyxb-mysql.services.clever-cloud.com

# Test port connectivity
telnet b7xrntk1gf8hqke2yyxb-mysql.services.clever-cloud.com 3306
```

### 3. Verify Clever Cloud Configuration
- Check if the MySQL service is running
- Verify the hostname is correct
- Ensure SSL is properly configured
- Check if the service plan allows external connections

### 4. Network/Firewall Issues
- Verify the deployment platform allows outbound connections to port 3306
- Check if Clever Cloud allows connections from your deployment platform
- Ensure no firewall rules are blocking the connection

## Monitoring and Logging

The updated configuration includes:
- Connection retry logic (3 attempts with 5-second delays)
- Detailed error logging
- Environment variable validation
- Connection pool error handling
- Keep-alive settings for stable connections

## Next Steps

1. **Verify Environment Variables**: Ensure all required variables are properly set in your deployment environment
2. **Test Connection**: Use the troubleshooting commands above to verify connectivity
3. **Check Clever Cloud**: Verify the MySQL service status and configuration
4. **Monitor Logs**: Watch for the new detailed logging output to identify specific issues

## Common Error Codes

- `ENOTFOUND`: Hostname cannot be resolved (DNS issue)
- `ECONNREFUSED`: Connection refused (service not running or blocked)
- `ETIMEDOUT`: Connection timeout (network/firewall issue)
- `PROTOCOL_CONNECTION_LOST`: Connection lost during operation
