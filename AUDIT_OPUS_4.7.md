# AUDITORIA DX03 — Opus 4.7

**Data:** 2026-05-27
**Escopo:** Full-Stack React+TypeScript + Node.js + Express + PostgreSQL (GCP GKE + Istio)
**Modo:** Read-only

---

## Resumo Quantitativo

| Métrica | Valor |
|---------|-------|
| Total findings | 47 |
| **P0** | 8 |
| **P1** | 14 |
| **P2** | 17 |
| **P3** | 8 |
| Server LoC | ~410 |
| Client LoC | ~390 |
| Test coverage | **0%** |
| TS backend | ❌ |
| TS frontend | ✅ strict |

---

## P0 — Critical (8)

### 1. Backend em JavaScript puro, sem validação de input
**Arquivo:** [server/src/](server/src/)

Sem TypeScript, sem Zod/Joi em nenhuma rota. Risco de injection, type confusion, data corruption.
**Fix:** Migrar para `.ts` + middleware `validateRequest()` com Zod em todas as rotas.

### 2. `/api/echo` aceita JSON arbitrário
**Arquivo:** [server/src/routes/api.js](server/src/routes/api.js#L57-L59)

`res.json({ received: req.body, ... })` sem validação. Reflex XSS, prototype pollution, JSON bomb.
**Fix:** Remover endpoint OU schema Zod + `express.json({ limit: '10kb' })`.

### 3. `/api/metrics` e `/metrics` públicos sem auth
**Arquivos:** [server/src/server.js](server/src/server.js#L24-L33), [server/src/routes/api.js](server/src/routes/api.js#L4-L20)

Expõe DB connection stats, endpoint patterns, response times — recon ideal.
**Fix:** Middleware com Bearer token (`METRICS_TOKEN`) para `/metrics`.

### 4. `/health` expõe `NODE_ENV` e DB stats
**Arquivo:** [server/src/routes/health.js](server/src/routes/health.js#L5-L40)
**Fix:** Separar `/health/live` (200 minimalista) e `/health/ready` (interno/admin).

### 5. Config sem validação de envs obrigatórias
**Arquivo:** [server/src/config/index.js](server/src/config/index.js)

`process.env.DB_PASSWORD` pode ser `undefined`; CORS tem fallback inseguro.
**Fix:** Validar lista de envs obrigatórias no boot; remover fallback de secrets.

### 6. Docker base images não pinadas
**Arquivos:** [server/Dockerfile](server/Dockerfile#L1), [client/Dockerfile](client/Dockerfile#L1)

`FROM node:20-alpine` / `FROM nginx:alpine` flutuam.
**Fix:** `node:20.11.0-alpine3.19`, `nginx:1.27.0-alpine`.

### 7. Frontend nginx roda como root
**Arquivo:** [client/Dockerfile](client/Dockerfile)
**Fix:** Adicionar `USER nginx:nginx` no stage de produção.

### 8. Zero testes (unit, integration, e2e)
**Fix:** Criar estrutura `__tests__/unit` + `integration` + smoke `e2e/`. Target 80% nas rotas críticas.

---

## P1 — High (14)

| # | Categoria | Título | Arquivo | Recomendação |
|---|-----------|--------|---------|---------------|
| 1 | Security | Sem rate limiting | [server/src/server.js](server/src/server.js) | `express-rate-limit` em `/api/`. |
| 2 | Secrets | CORS_ORIGIN em `.env.example` | [server/.env.example](server/.env.example#L9) | Deixar vazio com comentário. |
| 3 | Secrets | `admin123` como senha de exemplo | [server/.env.example](server/.env.example#L8) + [docker-compose.yml](docker-compose.yml#L11) | `<change_me>` ou gerar via `openssl rand`. |
| 4 | Security | nginx sem HSTS/CSP/Referrer-Policy/Permissions-Policy | [client/nginx.conf](client/nginx.conf) | Adicionar headers `always`. |
| 5 | Security | Payload sem limit no urlencoded | [server/src/server.js](server/src/server.js#L20-L21) | `limit: '10kb'`. |
| 6 | Security | Sem política de rotação de secrets | [server/src/config/index.js](server/src/config/index.js) | GCP Secret Manager + reload periódico; documentar em SECURITY.md. |
| 7 | CI/CD | Sem image scanning | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | Trivy + SARIF upload. |
| 8 | CI/CD | Tag `latest` sobrescreve sem verificação | [.github/workflows/deploy.yml](.github/workflows/deploy.yml#L70-L80) | Usar `${{ github.sha }}` no K8s; cosign para assinatura. |
| 9 | Security | `VITE_API_URL` exposto via ARG no Dockerfile (image history) | [client/Dockerfile](client/Dockerfile#L12) | Substituir via `sed`/envsubst pós-build ou runtime `window.__config__`. |
| 10 | K8s | Namespace hardcoded `dx03-dev` | [k8s/db-secret.yaml](k8s/db-secret.yaml#L3) | Placeholder substituído no deploy. |
| 11 | K8s | Sem NetworkPolicies | [k8s/](k8s/) | deny-all + allowlist por label. |
| 12 | K8s | Sem RBAC (ServiceAccount/Role/RoleBinding) | [k8s/](k8s/) | Criar SA dedicada com permissões mínimas. |
| 13 | K8s | Sem PodDisruptionBudget | [k8s/backend-deployment.yaml](k8s/backend-deployment.yaml) | `minAvailable: 1`. |
| 14 | Quality | package-lock pode estar fora de sync | [server/package.json](server/package.json) + [client/package.json](client/package.json) | `npm ci --audit` no CI; Dependabot. |

---

## P2 — Medium (17)

| # | Categoria | Título | Arquivo |
|---|-----------|--------|---------|
| 1 | Quality | Backend sem TypeScript | [server/src/](server/src/) |
| 2 | Reliability | Pool sem handler de erro fatal | [server/src/database.js](server/src/database.js#L16-L20) |
| 3 | Quality | Schema init inline no boot | [server/src/database.js](server/src/database.js#L26-L47) |
| 4 | Observability | Logging com `console.*` | [server/src/server.js](server/src/server.js) |
| 5 | Observability | Sem correlation IDs | [server/src/server.js](server/src/server.js) |
| 6 | Frontend | Sem build-time secrets stripping | [client/vite.config.ts](client/vite.config.ts) |
| 7 | Frontend | Sem ErrorBoundary | [client/src/App.tsx](client/src/App.tsx) |
| 8 | K8s | Ingress sem rate limiting / Cloud Armor | [k8s/ingress.yaml](k8s/ingress.yaml) |
| 9 | Docker | Healthcheck frontend genérico | [client/Dockerfile](client/Dockerfile#L24-L25) |
| 10 | Security | `/health-history` público | [server/src/routes/api.js](server/src/routes/api.js#L27-L40) |
| 11 | Docs | SECURITY.md ausente | — |
| 12 | Quality | Verificação `prom-client` presente | [server/package.json](server/package.json) (OK) |
| 13 | K8s | Sem `seccompProfile: RuntimeDefault` | [k8s/backend-deployment.yaml](k8s/backend-deployment.yaml#L18) |
| 14 | K8s | Sem GKE audit logging documentado | [k8s/](k8s/) |
| 15 | CI/CD | Sem branch protection | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| 16 | CI/CD | CODEOWNERS sem enforcement | [.github/CODEOWNERS](.github/CODEOWNERS) |
| 17 | Security | Health endpoints públicos (recon) | [server/src/routes/health.js](server/src/routes/health.js) |

Recomendações detalhadas: ver relatório completo (cada item tem snippet de fix sugerido).

---

## P3 — Low (8)

| # | Item | Arquivo |
|---|------|---------|
| 1 | `.env*` ignorado corretamente | [.gitignore](.gitignore) ✓ |
| 2 | Sem Dockerfile.dev (compose já cobre) | — |
| 3 | Certs GCP managed auto-renew | — |
| 4 | Sem CHANGELOG.md | — |
| 5 | Sem CONTRIBUTING.md | — |
| 6 | Sem runbook de deployment | [README.md](README.md) |
| 7 | `API_URL = window.location.origin` | [client/src/App.tsx](client/src/App.tsx#L9) ✓ |
| 8 | Sem load testing (k6/JMeter) | — |

---

## Pontos Fortes

1. **Frontend em TypeScript strict**.
2. **Helmet + CORS** configurados.
3. **PostgreSQL com pool** (não conexões diretas).
4. **prom-client** para métricas (mesmo que endpoint precise auth).
5. **Multi-stage Dockerfile** (frontend e backend).
6. **GKE managed certificates** com renovação automática.
7. **Health endpoints** existem (precisam ser sanitizados, mas a estrutura é boa).
8. **CODEOWNERS** existe (falta enforcement por branch protection).
9. **Vite + relative URLs** (`window.location.origin`).

---

## Roadmap

**Sprint 1 (P0):** Migrar para TS + Zod, remover/proteger `/echo` e `/metrics`, sanitizar `/health`, validar envs no boot, pinar Docker images, nginx non-root, bootstrap inicial de testes.

**Sprint 2 (P1):** Rate limit, secrets em GCP Secret Manager, Trivy/cosign no CI, NetworkPolicies, RBAC K8s, PDB, headers de segurança no nginx.

**Sprint 3 (P2):** TypeScript backend, pino/winston, correlation IDs, ErrorBoundary, seccomp, branch protection, SECURITY.md.

**Backlog (P3):** CHANGELOG, CONTRIBUTING, runbook, load testing.

---

## Distribuição

```
P0:  8  ████████
P1: 14  ██████████████
P2: 17  █████████████████
P3:  8  ████████
```

**Não pronto para produção.** P0+P1 = 22 findings críticos. Estimativa mínima: 3-4 sprints para hardening completo.
