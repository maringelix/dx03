// Loaded before any test module imports src/config (which validates env at boot).
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'dx03_test';
process.env.DB_USER = 'admin';
process.env.DB_PASSWORD = 'test-password-not-real';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.METRICS_TOKEN = 'test-metrics-token-1234567890abcdef';
