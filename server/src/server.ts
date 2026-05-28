import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config';
import { pool, initializeDatabase } from './database';
import healthRoutes from './routes/health';
import apiRoutes from './routes/api';
import { register, metricsMiddleware, updateDatabasePoolMetrics } from './metrics';
import { requireMetricsToken } from './middleware/auth';
import { correlationId } from './middleware/correlationId';
import logger from './utils/logger';

export function createApp(): express.Express {
  const app = express();

  app.use(correlationId);
  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info({ component: 'http' }, msg.trim()) },
    }),
  );
  app.use(metricsMiddleware);

  // 30s per-request hard timeout.
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(30_000, () => {
      if (!res.headersSent) {
        res.status(503).json({ error: 'Request timeout' });
      }
      req.destroy();
    });
    next();
  });

  app.get('/metrics', requireMetricsToken, async (_req: Request, res: Response) => {
    try {
      updateDatabasePoolMetrics(pool);
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch {
      res.status(500).end();
    }
  });

  app.use('/health', healthRoutes);
  app.use('/api', apiRoutes);

  app.get('/', (_req: Request, res: Response) => {
    res.json({ name: 'dx03-backend', status: 'running' });
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.url} not found`,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err, reqId: req.id, method: req.method, url: req.url }, 'Request error');
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();
    const app = createApp();
    app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.env }, 'Server running');
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

if (require.main === module) {
  void startServer();
}
