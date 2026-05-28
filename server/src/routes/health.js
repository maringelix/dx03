const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { requireMetricsToken } = require('../middleware/auth');

// Public liveness probe -- minimal payload, no env/db info
router.get('/', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe -- protected because it exposes DB state.
// Kubernetes probes should pass Authorization: Bearer ${METRICS_TOKEN}
// via httpGet.httpHeaders.
router.get('/ready', requireMetricsToken, async (req, res) => {
  const startTime = Date.now();
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as total_connections,
        COUNT(*) FILTER (WHERE state = 'active') as active_connections
      FROM pg_stat_activity
      WHERE datname = $1
    `, [process.env.DB_NAME]);

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
    console.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
