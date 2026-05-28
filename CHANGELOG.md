# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **S9 — Observability:** `pino` structured logging with secrets redaction (`authorization`, `cookie`, `set-cookie`, `password`, `token`, `secret`).
- **S9 — Observability:** `correlationId` middleware that validates `X-Request-Id` from clients or generates one; exposed as `req.id` and echoed on the response.
- **S9 — Frontend:** React `ErrorBoundary` wraps `<App />` to catch render errors without leaking stack traces to users.
- **S8 — CI/CD:** Trivy SARIF scan published to GitHub code scanning.
- **S6 — Headers:** Helmet defaults + strict CORS allowlist.
- **S3 — Foundations:** TypeScript build, Vitest tests, Express + `pg` baseline.

### Changed
- **S9 — Observability:** `morgan` HTTP logs now pipe through `pino` for unified structured output.
- **S9 — Observability:** Error handler logs `{ err, reqId, method, url }` instead of plain text.

### Security
- **S9 — Hardening:** Authorization/Cookie/Set-Cookie headers redacted from all logs by default.

## [0.1.0] — initial scaffold

- Express + TypeScript server with `/health`, `/live`, `/ready` endpoints.
- React + Vite client with TypeScript.
- Dockerfile (multi-stage), CI workflow (lint, typecheck, test, build).
