import { Router, type Request, type Response } from 'express';
import { pool } from '../database';
import { requireMetricsToken } from '../middleware/auth';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

router.get('/ready', requireMetricsToken, async (_req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    const { rows } = await pool.query(
      `SELECT
         COUNT(*) AS total_connections,
         COUNT(*) FILTER (WHERE state = 'active') AS active_connections
       FROM pg_stat_activity
       WHERE datname = $1`,
      [process.env.DB_NAME],
    );

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`,
        connections: rows[0],
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
      responseTime: `${Date.now() - startTime}ms`,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
