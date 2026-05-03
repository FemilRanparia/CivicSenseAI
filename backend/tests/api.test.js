import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import User from '../models/User.js';

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Connect to a test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civicsense_test');
    }
  });

  afterAll(async () => {
    // Clean up test database
    await User.deleteMany({ email: 'test@example.com' });
    await mongoose.connection.close();
  });

  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  let testUserId;

  it('POST /api/auth/signup should create a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        age: 25,
        state: 'Gujarat',
        firstTimeVoter: true,
        language: 'english'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    testUserId = res.body.token;
  });

  it('POST /api/auth/login should authenticate user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
