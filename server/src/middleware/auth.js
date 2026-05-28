const config = require('../config');

/**
 * Constant-time-ish Bearer token check. Rejects if METRICS_TOKEN is not set.
 * Use this on /metrics and any other recon-prone endpoint.
 */
function requireMetricsToken(req, res, next) {
  const expected = config.metrics.token;
  if (!expected) {
    return res.status(503).json({ error: 'metrics endpoint disabled' });
  }
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || token.length !== expected.length) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  // length-equal compare to avoid early-exit timing leaks
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

module.exports = { requireMetricsToken };
