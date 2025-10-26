const request = require('supertest');
const app = require('../server');

describe('Leave API', () => {
  let authToken;

  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        user_id: 'test123',
        password: 'password123'
      });
    
    authToken = response.body.token;
  });

  describe('POST /api/leaves/apply', () => {
    it('should create a leave application', async () => {
      const leaveData = {
        leave_type: 'Casual',
        start_date: '2024-02-01',
        start_session: 'Forenoon',
        end_date: '2024-02-02',
        end_session: 'Afternoon',
        reason: 'Family function',
        days: 2,
        arrangement_details: 'Class arrangements made'
      };

      const response = await request(app)
        .post('/api/leaves/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leaveData)
        .expect(200);

      expect(response.body).toHaveProperty('leave_id');
      expect(response.body.message).toContain('submitted successfully');
    });
  });

  // Add more tests...
});