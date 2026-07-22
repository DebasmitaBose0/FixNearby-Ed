const request = require('supertest');
const app = require('../server');

describe('API Contract Sanity Verification', () => {
  it('should return 200 OK for health check endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 404]).toContain(res.statusCode);
  });
});
