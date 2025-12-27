const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Get API metrics
router.get('/metrics', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        endpoint,
        method,
        AVG(response_time) as avg_response_time,
        COUNT(*) as request_count,
        COUNT(*) FILTER (WHERE status_code >= 400) as error_count
      FROM api_metrics
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY endpoint, method
      ORDER BY request_count DESC
      LIMIT 10
    `);

    res.json({
      metrics: rows,
      period: '1 hour',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get health check history
router.get('/health-history', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT timestamp, status, details
      FROM health_checks
      ORDER BY timestamp DESC
      LIMIT 100
    `);

    res.json({
      history: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
});

// Echo endpoint for testing
router.post('/echo', (req, res) => {
  res.json({
    received: req.body,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
