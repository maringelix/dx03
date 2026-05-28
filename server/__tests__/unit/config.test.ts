describe('config', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('exports validated config when all required envs are present', () => {
    const config = require('../../src/config').default;
    expect(config.env).toBe('test');
    expect(config.db.host).toBe('localhost');
    expect(config.db.port).toBe(5432);
    expect(config.cors.origin).toBe('http://localhost:5173');
    expect(config.metrics.token).toBe('test-metrics-token-1234567890abcdef');
  });

  it('throws when a required env var is missing', () => {
    const original = process.env.DB_HOST;
    delete process.env.DB_HOST;
    expect(() => require('../../src/config')).toThrow(/Missing required env vars.*DB_HOST/);
    process.env.DB_HOST = original;
  });

  it('throws on placeholder values in production', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalPwd = process.env.DB_PASSWORD;
    const originalToken = process.env.METRICS_TOKEN;
    process.env.NODE_ENV = 'production';
    process.env.DB_PASSWORD = '<change_me>';
    process.env.METRICS_TOKEN = 'long-enough-token-1234567890abcdef';
    expect(() => require('../../src/config')).toThrow(/placeholder values/);
    process.env.NODE_ENV = originalEnv;
    process.env.DB_PASSWORD = originalPwd;
    process.env.METRICS_TOKEN = originalToken;
  });

  it('throws when METRICS_TOKEN is too short in production', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalToken = process.env.METRICS_TOKEN;
    process.env.NODE_ENV = 'production';
    process.env.METRICS_TOKEN = 'short';
    expect(() => require('../../src/config')).toThrow(/METRICS_TOKEN is required in production/);
    process.env.NODE_ENV = originalEnv;
    process.env.METRICS_TOKEN = originalToken;
  });

  it('throws on invalid NODE_ENV', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'staging-typo';
    expect(() => require('../../src/config')).toThrow(/Invalid NODE_ENV/);
    process.env.NODE_ENV = original;
  });
});
