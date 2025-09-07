const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('./server');

describe('GET /api/health', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
  });
});
