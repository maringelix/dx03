require('dotenv').config();

/**
 * List of env vars that MUST be present for the server to start.
 * Add to this list whenever a new required env is introduced.
 */
const REQUIRED_ENVS = [
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'CORS_ORIGIN',
];

function assertEnv() {
  const missing = REQUIRED_ENVS.filter((k) => {
    const v = process.env[k];
    return v === undefined || v === null || v === '';
  });
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    const placeholders = REQUIRED_ENVS.filter((k) =>
      /<\s*change[_-]?me\s*>/i.test(process.env[k] || '')
    );
    if (placeholders.length > 0) {
      throw new Error(
        `Refusing to start: placeholder values in env (${placeholders.join(', ')})`
      );
    }
    if (!process.env.METRICS_TOKEN || process.env.METRICS_TOKEN.length < 32) {
      throw new Error('METRICS_TOKEN is required in production (min 32 chars)');
    }
  }
}

assertEnv();

const validEnvs = ['development', 'test', 'staging', 'production'];
if (!validEnvs.includes(process.env.NODE_ENV)) {
  throw new Error(`Invalid NODE_ENV "${process.env.NODE_ENV}" (expected one of ${validEnvs.join(', ')})`);
}

module.exports = {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  metrics: {
    token: process.env.METRICS_TOKEN || null,
  },
};
