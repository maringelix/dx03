# Contributing

## Branch & PR Workflow

- Base branch: `master`.
- Topic branches: `audit/<scope>-<topic>` or `feat/<topic>`, `fix/<topic>`.
- Open PRs against `master`. CI runs lint + typecheck + tests + build + SonarCloud.
- Squash-merge after green CI.

## Local Setup

```bash
# Server
cd server
npm ci
npm run dev       # tsx watch
npm run typecheck
npm test

# Client
cd client
npm ci
npm run dev
npm run lint
npm run build
```

## Code Style

- **TypeScript strict mode** on both server and client.
- **ESLint** with `--max-warnings 0` and `--report-unused-disable-directives` — keep the lint surface clean.
- Prefer named exports; no default exports for utilities.

## Commit Messages

Conventional Commits, e.g.:

```
feat(s09): add correlation ID middleware
fix(health): treat readiness DB error as 503
docs: update SECURITY.md
```

## Tests

- New routes/middleware need at least one Vitest unit or integration test.
- HTTP integration tests use `supertest` against the Express app.

## Security

See [SECURITY.md](./SECURITY.md). Never commit `.env`, tokens, or service-account keys.
