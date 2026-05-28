import { Router, type Request, type Response } from 'express';
import { pool } from '../database';
import { requireMetricsToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { apiMetricsQuerySchema, healthHistoryQuerySchema } from '../schemas';

const router = Router();

router.get(
  '/metrics',
  requireMetricsToken,
  validateRequest({ query: apiMetricsQuerySchema }),
  async (_req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT
          endpoint,
          method,
          AVG(response_time) AS avg_response_time,
          COUNT(*) AS request_count,
          COUNT(*) FILTER (WHERE status_code >= 400) AS error_count
        FROM api_metrics
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        GROUP BY endpoint, method
        ORDER BY request_count DESC
        LIMIT 10
      `);

      res.json({ metrics: rows, period: '1 hour' });
    } catch {
      res.status(500).json({ error: 'internal' });
    }
  },
);

router.get(
  '/health-history',
  requireMetricsToken,
  validateRequest({ query: healthHistoryQuerySchema }),
  async (req: Request, res: Response) => {
    try {
      const limit = (req.query as { limit?: number }).limit ?? 100;
      const { rows } = await pool.query(
        `SELECT timestamp, status, details
         FROM health_checks
         ORDER BY timestamp DESC
         LIMIT $1`,
        [limit],
      );

      res.json({ history: rows });
    } catch {
      res.status(500).json({ error: 'internal' });
    }
  },
);

router.get('/test', (_req: Request, res: Response) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
