import { Pool } from 'pg';
import config from './config';
import logger from './utils/logger';

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info({ component: 'db' }, 'Database connected');
});

pool.on('error', (err: Error) => {
  logger.fatal({ err, component: 'db' }, 'Unexpected database error');
  process.exit(-1);
});

export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS health_checks (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(20) NOT NULL,
      details JSONB
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_metrics (
      id SERIAL PRIMARY KEY,
      endpoint VARCHAR(255) NOT NULL,
      method VARCHAR(10) NOT NULL,
      status_code INTEGER NOT NULL,
      response_time INTEGER NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
