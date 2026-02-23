# dx03 — Full-Stack Application (GKE)

[![CI](https://github.com/maringelix/dx03/actions/workflows/ci.yml/badge.svg)](https://github.com/maringelix/dx03/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Full-stack web application built with React + TypeScript (frontend) and Node.js + Express + PostgreSQL (backend), deployed to Google Kubernetes Engine via CI/CD.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React +    │────▶│  Express.js  │────▶│  PostgreSQL  │
│  TypeScript  │     │   REST API   │     │  (Cloud SQL) │
│   (Vite)     │     │   Port 3000  │     │   Port 5432  │
└──────────────┘     └──────────────┘     └──────────────┘
     nginx                 Node.js            Cloud SQL
   Port 80               + Prometheus         Private IP
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 20, Express.js, PostgreSQL (pg) |
| Infrastructure | GKE, Cloud SQL, Artifact Registry |
| CI/CD | GitHub Actions → GKE deploy |
| Monitoring | Prometheus metrics, structured logging |

## Project Structure

```
├── client/          # React + TypeScript frontend
│   ├── src/
│   └── Dockerfile
├── server/          # Node.js + Express backend
│   ├── src/
│   └── Dockerfile
├── k8s/             # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   └── namespace.yaml
└── docker-compose.yml
```

## Quick Start

```bash
# Local development with Docker Compose
docker-compose up -d

# Or run individually
cd server && npm install && npm start
cd client && npm install && npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe (DB check) |
| GET | `/api/*` | Application REST API |

## Deployment

Deployed via GitHub Actions (`workflow_dispatch`):

```bash
# Trigger deployment manually from GitHub Actions UI
# Workflow: deploy.yml → Builds images → Pushes to Artifact Registry → Deploys to GKE
```

## Security

- Non-root container execution (`USER node`)
- Pod security context with `runAsNonRoot`, `readOnlyRootFilesystem`
- Secrets managed via Kubernetes Secrets
- No default password fallbacks in configuration

## License

MIT
