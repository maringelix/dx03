import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';
import type { Pool } from 'pg';

export const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'dx03_backend_',
});

const httpRequestDuration = new client.Histogram({
  name: 'dx03_backend_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
});

const httpRequestTotal = new client.Counter({
  name: 'dx03_backend_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestInProgress = new client.Gauge({
  name: 'dx03_backend_http_requests_in_progress',
  help: 'Number of HTTP requests currently in progress',
  labelNames: ['method', 'route'],
});

const databaseConnectionPool = new client.Gauge({
  name: 'dx03_backend_db_pool_connections',
  help: 'Number of database connections in the pool',
  labelNames: ['state'],
});

const databaseQueryDuration = new client.Histogram({
  name: 'dx03_backend_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
});

const databaseQueryTotal = new client.Counter({
  name: 'dx03_backend_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['query_type', 'status'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestInProgress);
register.registerMetric(databaseConnectionPool);
register.registerMetric(databaseQueryDuration);
register.registerMetric(databaseQueryTotal);

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const route = req.route?.path ?? req.path;
  const method = req.method;

  httpRequestInProgress.inc({ method, route });
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const statusCode = res.statusCode;
    end({ method, route, status_code: statusCode });
    httpRequestTotal.inc({ method, route, status_code: statusCode });
    httpRequestInProgress.dec({ method, route });
  });

  next();
}

export function updateDatabasePoolMetrics(pool: Pool | undefined): void {
  if (!pool) return;
  databaseConnectionPool.set({ state: 'total' }, pool.totalCount ?? 0);
  databaseConnectionPool.set({ state: 'idle' }, pool.idleCount ?? 0);
  databaseConnectionPool.set({ state: 'waiting' }, pool.waitingCount ?? 0);
}

export async function trackDatabaseQuery<T>(
  queryType: string,
  queryFn: () => Promise<T>,
): Promise<T> {
  const end = databaseQueryDuration.startTimer();
  try {
    const result = await queryFn();
    end({ query_type: queryType });
    databaseQueryTotal.inc({ query_type: queryType, status: 'success' });
    return result;
  } catch (error) {
    end({ query_type: queryType });
    databaseQueryTotal.inc({ query_type: queryType, status: 'error' });
    throw error;
  }
}

export const metrics = {
  httpRequestDuration,
  httpRequestTotal,
  httpRequestInProgress,
  databaseConnectionPool,
  databaseQueryDuration,
  databaseQueryTotal,
};
