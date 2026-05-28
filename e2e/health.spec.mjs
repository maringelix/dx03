/**
 * Smoke test for /health endpoints.
 *
 * Usage:
 *   BASE_URL=https://dx03.example.com node e2e/health.spec.mjs
 *
 * Exits 0 on success, 1 on any failure. Intended for post-deploy gates;
 * does NOT cover authenticated endpoints (those need METRICS_TOKEN injected
 * by the deploy environment).
 */
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function check(path, expected) {
  const res = await fetch(`${baseUrl}${path}`);
  if (res.status !== expected) {
    throw new Error(`${path}: expected ${expected}, got ${res.status}`);
  }
  return res;
}

async function main() {
  await check('/health', 200);
  await check('/health/live', 200);
  // /health/ready requires Bearer token; expect 401 when called anonymously.
  await check('/health/ready', 401);
  // /metrics likewise.
  await check('/metrics', 401);
  console.log(`[smoke] OK ${baseUrl}`);
}

main().catch((err) => {
  console.error(`[smoke] FAIL: ${err.message}`);
  process.exit(1);
});
