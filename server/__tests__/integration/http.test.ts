import request from 'supertest';

jest.mock('../../src/database', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  },
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

import { pool } from '../../src/database';
import { createApp } from '../../src/server';

const app = createApp();
const TOKEN = 'test-metrics-token-1234567890abcdef';

describe('HTTP integration (mocked DB)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns minimal payload', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'dx03-backend', status: 'running' });
  });

  it('GET /health/live returns alive', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'alive' });
  });

  it('GET /health returns alive (public liveness)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'alive' });
  });

  it('GET /health/ready is protected (401 without token)', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(401);
  });

  it('GET /health/ready returns 200 when authorized and DB is reachable', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ ok: 1 }] })
      .mockResolvedValueOnce({ rows: [{ total_connections: '5', active_connections: '1' }] });
    const res = await request(app)
      .get('/health/ready')
      .set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database.status).toBe('connected');
  });

  it('GET /metrics is protected (401 without token)', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(401);
  });

  it('GET /metrics returns prometheus payload when authorized', async () => {
    const res = await request(app)
      .get('/metrics')
      .set('Authorization', `Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/dx03_backend_/);
  });

  it('GET /api/metrics is protected', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.status).toBe(401);
  });

  it('GET /api/test returns payload publicly', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('API is working!');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });

  it('does not expose /api/echo (removed in S02)', async () => {
    const res = await request(app).post('/api/echo').send({ hello: 'world' });
    expect(res.status).toBe(404);
  });
});
