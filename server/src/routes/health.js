const express = require('express');
const router = express.Router();
const { pool } = require('../database');

router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbStart = Date.now();
    await pool.query('SELECT NOW()');
    const dbLatency = Date.now() - dbStart;

    // Get database stats
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as total_connections,
        COUNT(*) FILTER (WHERE state = 'active') as active_connections
      FROM pg_stat_activity
      WHERE datname = $1
    `, [process.env.DB_NAME]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
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
    };

    // Log health check to database
    await pool.query(
      'INSERT INTO health_checks (status, details) VALUES ($1, $2)',
      ['healthy', JSON.stringify(health)]
    );

    res.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const unhealthy = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'disconnected',
      },
    };

    res.status(503).json(unhealthy);
  }
});

router.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

module.exports = router;
