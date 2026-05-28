import type { Request, Response, NextFunction } from 'express';
import config from '../config';

/**
 * Constant-time Bearer token check against METRICS_TOKEN.
 * Refuses if METRICS_TOKEN is not configured.
 */
export function requireMetricsToken(req: Request, res: Response, next: NextFunction): void {
  const expected = config.metrics.token;
  if (!expected) {
    res.status(503).json({ error: 'metrics endpoint disabled' });
    return;
  }
  const header = (req.headers.authorization as string | undefined) ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || token.length !== expected.length) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  if (mismatch !== 0) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
}
