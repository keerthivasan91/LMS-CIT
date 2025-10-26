const request = require('supertest');
const app = require('../server');

describe('HOD API', () => {
  let hodToken;

  beforeAll(async () => {
    // Login as HOD
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        user_id: 'hod123',
        password: 'password123'
      });
    
    hodToken = response.body.token;
  });

  describe('GET /api/hod/dashboard', () => {
    it('should return pending leaves for HOD', async () => {
      const response = await request(app)
        .get('/api/hod/dashboard')
        .set('Authorization', `Bearer ${hodToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('requests');
      expect(Array.isArray(response.body.requests)).toBe(true);
    });
  });

  // Add more tests...
});