// Ensure test env
process.env.NODE_ENV = 'test';

// After all tests, close database pool if available
afterAll(async () => {
  try {
    const db = require('./db');
    if (typeof db.closePool === 'function') {
      await db.closePool();
    }
  } catch (e) {
    // ignore
  }
});


