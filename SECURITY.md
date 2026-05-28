# Security Policy

## Reporting Vulnerabilities

If you discover a security issue, **do not** open a public issue. Contact the maintainer privately via GitHub.

## Security Posture

| Layer | Control |
|-------|---------|
| **Secrets** | All credentials via environment variables / GCP Secret Manager; no defaults in code |
| **Container** | Non-root user, multi-stage TypeScript build, minimal runtime image |
| **Network** | CORS restricted to configured origin, Helmet security headers, HTTPS enforced via GCP Load Balancer |
| **Database** | Cloud SQL via Cloud SQL Proxy / IAM auth, parameterized queries (`pg`), TLS enforced |
| **Auth** | JWT validated by `validateRequest` (Zod schemas) on every protected route |
| **Observability** | `pino` structured logging with secrets redaction (`authorization`, `cookie`, `set-cookie`, `password`, `token`, `secret`); `X-Request-Id` correlation per request |
| **Frontend** | React `ErrorBoundary` catches render errors without leaking stack to user |
| **CI** | Lint, typecheck, tests, build, SonarCloud on every PR; deploy requires manual dispatch |
| **Dependencies** | Lock files committed, `npm audit` in CI (informational), Trivy SARIF scan, Dependabot weekly |

## Environment Variables

All sensitive configuration is injected at runtime via environment variables or GCP Secret Manager references.
See `server/.env.example` for the full list of required variables.

No `.env` files, API keys, or credentials are committed to this repository.

## Supported Versions

Only the latest commit on `master` receives security fixes.
