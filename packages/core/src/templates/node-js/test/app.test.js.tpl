import request from 'supertest';
import app from '../src/index.js';

describe('Health Endpoints', () => {
  test('GET /health should return OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Service is healthy');
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /health/detailed should return detailed information', async () => {
    const response = await request(app)
      .get('/health/detailed')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.checks).toBeDefined();
    expect(response.body.system).toBeDefined();
  });
});

describe('API Endpoints', () => {
  test('GET / should return welcome message', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.body.message).toContain('Welcome to');
    expect(response.body.version).toBe('1.0.0');
  });

  test('GET /api/welcome should return API welcome', async () => {
    const response = await request(app)
      .get('/api/welcome')
      .expect(200);
    
    expect(response.body.message).toContain('Welcome to');
    expect(response.body.endpoints).toBeDefined();
  });
});

describe('User Endpoints', () => {
  test('GET /api/users should return users list', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/users should create new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(newUser.name);
    expect(response.body.data.email).toBe(newUser.email);
    expect(response.body.data.id).toBeDefined();
  });

  test('POST /api/users should fail without required fields', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('required');
  });
});

describe('Error Handling', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);
    
    expect(response.body.error).toBe('Not Found');
    expect(response.body.statusCode).toBe(404);
  });
});
