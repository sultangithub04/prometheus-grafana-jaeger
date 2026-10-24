
const request = require('supertest');
const app = require('../src/app');

describe('Observability Demo API', () => {
  test('GET / returns service information', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/users returns users', async () => {
    const res = await request(app).get('/api/users');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /api/error returns 500', async () => {
    const res = await request(app).get('/api/error');

    expect(res.statusCode).toBe(500);
  });

  test('unknown endpoint returns 404', async () => {
    const res = await request(app).get('/unknown');

    expect(res.statusCode).toBe(404);
  });
});
