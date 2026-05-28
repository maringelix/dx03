const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config');
const { pool, initializeDatabase } = require('./database');
const healthRoutes = require('./routes/health');
const apiRoutes = require('./routes/api');
const { register, metricsMiddleware, updateDatabasePoolMetrics } = require('./metrics');
const { requireMetricsToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('combined'));

// Prometheus metrics middleware (before routes)
app.use(metricsMiddleware);

// Prometheus metrics endpoint (protected by Bearer METRICS_TOKEN)
app.get('/metrics', requireMetricsToken, async (req, res) => {
  try {
    updateDatabasePoolMetrics(pool);
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end();
  }
});

// Routes
app.use('/health', healthRoutes);
app.use('/api', apiRoutes);

// Root endpoint -- minimal, no env/version leak
app.get('/', (req, res) => {
  res.json({
    name: 'dx03-backend',
    status: 'running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler -- never leak err.message/stack to client
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});

startServer();

module.exports = app;
