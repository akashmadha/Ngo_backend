const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from multiple .env files
// Priority: .env.local > .env.production > .env
const envFiles = [
  '.env.local',
  '.env.production', 
  '.env'
];

// Get the directory where this config file is located
const envDir = __dirname;

// Load each .env file if it exists
envFiles.forEach(envFile => {
  const envPath = path.join(envDir, envFile);
  try {
    const result = dotenv.config({ path: envPath });
    if (result.parsed && Object.keys(result.parsed).length > 0) {
      console.log(`✅ Loaded environment variables from ${envFile}`);
    }
  } catch (error) {
    // Silently ignore if file doesn't exist
    if (error.code !== 'ENOENT') {
      console.warn(`⚠️ Warning loading ${envFile}:`, error.message);
    }
  }
});

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file configuration');
} else {
  console.log('✅ All required environment variables are set');
}

module.exports = dotenv;
