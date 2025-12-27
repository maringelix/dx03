# 🚀 DX03 - Fullstack Application - 2025

[![CI](https://github.com/maringelix/dx03/actions/workflows/ci.yml/badge.svg)](https://github.com/maringelix/dx03/actions/workflows/ci.yml)
[![Deploy](https://github.com/maringelix/dx03/actions/workflows/deploy.yml/badge.svg)](https://github.com/maringelix/dx03/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Uma aplicação fullstack moderna com **React + TypeScript + Vite** no frontend e **Node.js + Express + PostgreSQL** no backend, pronta para deploy em **Google Cloud Platform (GKE)**.

---

## ⚠️ **Important Security Notice**

> 🔒 **This is a demonstration/portfolio project for learning purposes.**

**Security Best Practices:**

- ⚠️ **DO NOT** hardcode database credentials or API keys in the code
- ✅ Use environment variables (`.env` files) for local development
- ✅ Use **Kubernetes Secrets** or **GitHub Secrets** for production
- ✅ The `.env` file is in `.gitignore` and never committed
- ✅ Use `.env.example` as a template (no real credentials)
- ✅ Review and adjust CORS settings for your domain
- ✅ Implement rate limiting and input validation in production
- ✅ Enable HTTPS/TLS for all production traffic

**Database Connection:**
- Local: Uses environment variables from `.env` or Docker Compose
- Production: Credentials injected via Kubernetes Secrets (from Cloud SQL)
- No credentials are stored in the code or repository

**This project is safe to share publicly** - All sensitive data is properly externalized.

---

## 📋 Índice

- [Sobre](#sobre)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Build e Deploy](#build-e-deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Docker](#docker)
- [Kubernetes](#kubernetes)
- [CI/CD](#cicd)

## 🎯 Sobre

DX03 é uma aplicação fullstack completa que demonstra:
- ✅ Frontend React com **TypeScript + Vite** para desenvolvimento ultra-rápido
- ✅ Backend RESTful com **Express + PostgreSQL**
- ✅ **Health check endpoints** para Kubernetes liveness/readiness probes
- ✅ **Métricas e observabilidade** em tempo real
- ✅ **CORS e segurança** configurados (Helmet, HTTPS)
- ✅ **Hot reload** em desenvolvimento
- ✅ **Multi-stage Docker builds** otimizados (<100MB)
- ✅ **Kubernetes-ready** para deploy em GKE (Google Kubernetes Engine)
- ✅ **CI/CD** automatizado com GitHub Actions

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI moderna
- **TypeScript** - Type safety e IntelliSense
- **Vite 5** - Build tool e dev server ultra-rápido (HMR instantâneo)
- **CSS3** - Estilização responsiva

### Backend
- **Node.js 20** - Runtime JavaScript
- **Express 4** - Framework web minimalista e rápido
- **PostgreSQL 16** - Banco de dados relacional robusto
- **pg** - Cliente PostgreSQL nativo (melhor performance)
- **Helmet** - Security headers (XSS, clickjacking, etc)
- **Morgan** - Logger HTTP para debugging
- **CORS** - Cross-Origin Resource Sharing
- **Compression** - Gzip para respostas HTTP

### DevOps
- **Docker** - Containerização com multi-stage builds
- **Kubernetes** - Orquestração de containers
- **GitHub Actions** - CI/CD pipelines automatizados
- **Nginx** - Servidor web para frontend (produção)
- **Nodemon** - Auto-reload no desenvolvimento

## ⚙️ Pré-requisitos

- **Node.js 20** ou superior
- **npm 10** ou superior
- **Docker Desktop** (para desenvolvimento local)
- **Git**

## 📦 Instalação

### Clone o repositório
```bash
git clone https://github.com/maringelix/dx03.git
cd dx03
```

### Opção 1: Docker Compose (⭐ Recomendado)
```bash
# Inicia todos os serviços (frontend + backend + PostgreSQL)
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar todos os serviços
docker-compose down
```

### Opção 2: Instalação Manual

**1. Instale as dependências:**
```bash
# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

**2. Configure o banco de dados:**
```bash
# Opção A: PostgreSQL com Docker
docker run -d \
  --name dx03-postgres \
  -e POSTGRES_DB=dx03 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -p 5432:5432 \
  postgres:16-alpine

# Opção B: Use sua instalação local do PostgreSQL
# Configure as credenciais no .env
```

**3. Configure variáveis de ambiente:**
```bash
# Backend
cd server
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL
```

## 🚀 Desenvolvimento

### Com Docker Compose (Mais Fácil)
```bash
docker-compose up
```

Acesse:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Manualmente (Desenvolvimento Nativo)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Roda em http://localhost:3000
# Auto-reload com nodemon
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Roda em http://localhost:5173
# Hot Module Replacement (HMR)
```

## 📁 Estrutura do Projeto

```
dx03/
├── client/                       # Frontend React + TypeScript
│   ├── src/
│   │   ├── App.tsx              # Componente principal (Dashboard)
│   │   ├── App.css              # Estilos do app
│   │   ├── main.tsx             # Entry point React
│   │   └── index.css            # Estilos globais
│   ├── index.html               # HTML template
│   ├── vite.config.ts           # Configuração Vite
│   ├── tsconfig.json            # TypeScript config
│   ├── nginx.conf               # Nginx para produção
│   ├── Dockerfile               # Multi-stage build
│   └── package.json             # Dependências frontend
│
├── server/                       # Backend Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js         # Configurações (env vars)
│   │   ├── routes/
│   │   │   ├── health.js        # Health check endpoints
│   │   │   └── api.js           # API routes (metrics, etc)
│   │   ├── database.js          # PostgreSQL connection pool
│   │   └── server.js            # Entry point servidor
│   ├── .env.example             # Template de variáveis
│   ├── Dockerfile               # Container backend
│   └── package.json             # Dependências backend
│
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml           # Namespace isolado
│   ├── configmap.yaml           # Configs não-sensíveis
│   ├── backend-deployment.yaml  # Deployment backend (2 replicas)
│   ├── backend-service.yaml     # Service backend (ClusterIP)
│   ├── frontend-deployment.yaml # Deployment frontend (2 replicas)
│   ├── frontend-service.yaml    # Service frontend (ClusterIP)
│   └── ingress.yaml             # Load Balancer + routing
│
├── .github/workflows/            # CI/CD
│   ├── ci.yml                   # Lint, test, build
│   └── deploy.yml               # Deploy to GKE
│
├── docker-compose.yml           # Desenvolvimento local
├── README.md                    # Este arquivo
└── LICENSE                      # MIT License
```

## 🔌 API Endpoints

### Health Checks (Kubernetes Probes)

**GET** `/health` - Status completo da aplicação
```json
{
  "status": "healthy",
  "timestamp": "2025-12-26T12:00:00.000Z",
  "uptime": 3645.23,
  "environment": "production",
  "database": {
    "status": "connected",
    "latency": "5ms",
    "connections": {
      "total_connections": "10",
      "active_connections": "2"
    }
  },
  "memory": {
    "used": "50MB",
    "total": "128MB"
  },
  "responseTime": "10ms"
}
```

**GET** `/health/ready` - Readiness probe (verifica database)
```json
{ "status": "ready" }
```

**GET** `/health/live` - Liveness probe (verifica processo Node.js)
```json
{ "status": "alive" }
```

### API Routes

**GET** `/api/metrics` - Métricas da aplicação (última 1 hora)
```json
{
  "metrics": [
    {
      "endpoint": "/health",
      "method": "GET",
      "avg_response_time": 5.2,
      "request_count": 1234,
      "error_count": 0
    },
    {
      "endpoint": "/api/test",
      "method": "GET",
      "avg_response_time": 12.5,
      "request_count": 567,
      "error_count": 3
    }
  ],
  "period": "1 hour"
}
```

**GET** `/api/health-history` - Histórico de health checks (últimos 100)
```json
{
  "history": [
    {
      "timestamp": "2025-12-26T12:00:00Z",
      "status": "healthy",
      "details": { /* full health object */ }
    },
    // ... mais 99 registros
  ]
}
```

**GET** `/api/test` - Endpoint de teste simples
```json
{
  "message": "API is working!",
  "timestamp": "2025-12-26T12:00:00Z"
}
```

**POST** `/api/echo` - Echo request body (útil para debug)
```bash
curl -X POST http://localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```
```json
{
  "received": {
    "message": "Hello World"
  },
  "timestamp": "2025-12-26T12:00:00Z"
}
```

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

```env
# Node Environment
NODE_ENV=development          # development | production
PORT=3000                     # Porta do servidor

# Database PostgreSQL
DB_HOST=localhost             # Hostname do banco
DB_PORT=5432                  # Porta PostgreSQL padrão
DB_NAME=dx03                  # Nome do banco de dados
DB_USER=admin                 # Usuário do banco
DB_PASSWORD=admin123          # Senha (use algo forte em prod!)

# CORS Configuration
CORS_ORIGIN=http://localhost:5173  # URL do frontend (dev)
# Em produção: CORS_ORIGIN=https://app.example.com

# Logging
LOG_LEVEL=info                # debug | info | warn | error
```

### Frontend (build-time)

Configurado em `client/vite.config.ts`:
```env
VITE_API_URL=http://localhost:3000  # Backend API URL
```

**Produção (Kubernetes):**
As variáveis são injetadas via **ConfigMaps** (não-sensíveis) e **Secrets** (sensíveis).
Ver arquivos em `k8s/configmap.yaml` e comandos no workflow `deploy.yml`.

## 📦 Build e Deploy

### Build do Frontend
```bash
cd client
npm run build
# Cria pasta dist/ com assets otimizados (~150KB gzipped)
```

### Build do Backend
```bash
cd server
npm start
# Roda em modo produção (NODE_ENV=production, sem nodemon)
```

### Docker Build Local

**Frontend:**
```bash
cd client
docker build -t dx03-frontend:local .
docker run -p 8080:80 dx03-frontend:local
# Acesse: http://localhost:8080
```

**Backend:**
```bash
cd server
docker build -t dx03-backend:local .
docker run -p 3000:3000 --env-file .env dx03-backend:local
# Acesse: http://localhost:3000/health
```

### Deploy para GKE (Produção)

O deploy é **totalmente automatizado** via GitHub Actions quando você faz push na branch `main`:

1. ✅ Build das imagens Docker (frontend + backend)
2. ✅ Push para **Google Artifact Registry**
3. ✅ Security scan das imagens (gcloud)
4. ✅ Deploy no GKE usando `kubectl apply`
5. ✅ Wait for rollout
6. ✅ Health checks
7. ✅ Deploy summary com IPs e URLs

**Deploy manual (caso necessário):**
```bash
# 1. Autenticar no GCP
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Get GKE credentials
gcloud container clusters get-credentials tx03-dev-cluster --region us-central1

# 3. Apply Kubernetes manifests
kubectl apply -f k8s/

# 4. Verificar status
kubectl get pods -n dx03-dev
kubectl get services -n dx03-dev
kubectl get ingress -n dx03-dev
```

## 🐳 Docker

### Docker Compose (Desenvolvimento)

O `docker-compose.yml` configura **3 serviços interconectados**:

1. **postgres** - PostgreSQL 16-alpine (database)
2. **backend** - Node.js API (depende do postgres)
3. **frontend** - React + Nginx (depende do backend)

```bash
# Iniciar tudo
docker-compose up -d

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Parar tudo
docker-compose down

# Remover volumes (limpar banco de dados completamente)
docker-compose down -v

# Rebuild das imagens (após mudanças no código)
docker-compose up -d --build
```

### Multi-stage Builds

**Frontend:** `client/Dockerfile`
- **Stage 1 (builder)**: Build com Node.js 20 (npm ci + vite build)
- **Stage 2 (production)**: Serve com Nginx Alpine (~**50MB final**)
- Otimizações: Cache de npm, apenas dist/ copiado

**Backend:** `server/Dockerfile`
- Build otimizado com `npm ci --production`
- Imagem final: **Node 20 Alpine** (~150MB)
- **Health check integrado** no Dockerfile
- **Non-root user** (node) para segurança

## ☸️ Kubernetes

### Manifests Explicados

O diretório `k8s/` contém **7 arquivos YAML**:

**1. namespace.yaml** - Namespace isolado `dx03-dev`
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dx03-dev
```

**2. configmap.yaml** - Configurações não-sensíveis
```yaml
data:
  NODE_ENV: "production"
  PORT: "3000"
  DB_PORT: "5432"
  CORS_ORIGIN: "https://app.example.com"
```

**3. backend-deployment.yaml** - Deployment do backend
- **2 replicas** para alta disponibilidade
- Liveness/Readiness probes em `/health/live` e `/health/ready`
- Resource limits (CPU: 500m, Memory: 512Mi)
- Secrets para credenciais do banco

**4. backend-service.yaml** - Service ClusterIP
- Expõe o backend internamente na porta 80

**5. frontend-deployment.yaml** - Deployment do frontend
- **2 replicas** para alta disponibilidade
- Health probes em `/health`
- Resource limits (CPU: 200m, Memory: 256Mi)

**6. frontend-service.yaml** - Service ClusterIP
- Expõe o frontend internamente na porta 80

**7. ingress.yaml** - Load Balancer + routing
- Path-based routing: `/api/*` → backend, `/*` → frontend
- Cloud Armor security policy
- Static IP reservado

### Deploy Manual em Kubernetes

```bash
# Apply all manifests de uma vez
kubectl apply -f k8s/

# Check status dos pods
kubectl get pods -n dx03-dev
# NAME                            READY   STATUS    RESTARTS   AGE
# dx03-backend-7d9f8c5b6d-abc12   1/1     Running   0          2m
# dx03-backend-7d9f8c5b6d-def34   1/1     Running   0          2m
# dx03-frontend-5c8d7b9a4f-ghi56  1/1     Running   0          2m
# dx03-frontend-5c8d7b9a4f-jkl78  1/1     Running   0          2m

# Check services
kubectl get services -n dx03-dev

# Check ingress (Load Balancer IP)
kubectl get ingress -n dx03-dev
# NAME           CLASS    HOSTS   ADDRESS          PORTS   AGE
# dx03-ingress   <none>   *       34.120.45.123    80      5m

# View logs em tempo real
kubectl logs -f deployment/dx03-backend -n dx03-dev
kubectl logs -f deployment/dx03-frontend -n dx03-dev

# Scale deployment (aumentar/diminuir replicas)
kubectl scale deployment/dx03-backend --replicas=3 -n dx03-dev

# Port forward para testar localmente (sem passar pelo LB)
kubectl port-forward svc/dx03-backend 3000:80 -n dx03-dev
kubectl port-forward svc/dx03-frontend 8080:80 -n dx03-dev

# Restart deployment (força rolling update)
kubectl rollout restart deployment/dx03-backend -n dx03-dev

# Check rollout status
kubectl rollout status deployment/dx03-backend -n dx03-dev
```

### Health Probes (Kubernetes)

**Liveness Probe** - Verifica se o processo está vivo (restart se falhar 3x):
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30    # Espera 30s antes do primeiro check
  periodSeconds: 10          # Check a cada 10s
  timeoutSeconds: 5          # Timeout de 5s
  failureThreshold: 3        # Restart após 3 falhas consecutivas
```

**Readiness Probe** - Verifica se está pronto para receber tráfego (remove do Service se falhar):
```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 10    # Primeiro check em 10s
  periodSeconds: 5           # Check a cada 5s
  timeoutSeconds: 3          # Timeout de 3s
  failureThreshold: 3        # Remove do balanceamento após 3 falhas
```

## 📊 Observabilidade

### Métricas Disponíveis

A aplicação expõe métricas detalhadas em **`/api/metrics`**:
- Endpoints mais chamados (top 10)
- Tempo médio de resposta (ms)
- Taxa de erros (4xx, 5xx)
- Contagem total de requisições
- Período: última 1 hora

**Exemplo de uso:**
```bash
# Ver métricas em tempo real
watch -n 5 'curl -s http://localhost:3000/api/metrics | jq ".metrics[:3]"'
```

### Logs Estruturados

O backend usa **Morgan** para logging HTTP detalhado:
```
GET /health 200 5.234ms
POST /api/echo 200 12.567ms - 45 bytes
GET /api/metrics 200 8.123ms
GET /health/live 200 1.234ms
```

Formato em produção (combinado):
```
::1 - - [26/Dec/2025:12:00:00 +0000] "GET /health HTTP/1.1" 200 523 "-" "Mozilla/5.0"
```

### Health Dashboard (Frontend)

O frontend exibe um **dashboard em tempo real** com:
- ✅ Status geral da aplicação (healthy/unhealthy)
- ⏱️ Uptime do servidor (formatado)
- 🗄️ Status do banco de dados (connected/disconnected)
- 📊 Latência da conexão PostgreSQL
- 💾 Uso de memória (heap used/total)
- 🔄 Auto-refresh a cada 10 segundos
- ⚡ Response time do último health check

## 🚀 CI/CD

### GitHub Actions Workflows

**✅ CI (`ci.yml`)** - Executa em **todo push e PR**:
1. Lint e type checking (TypeScript + ESLint)
2. Build do frontend (vite build)
3. Tests do backend (Jest) - opcional por enquanto
4. **Docker build test** (valida Dockerfiles sem push)
5. Matrix strategy (frontend + backend em paralelo)

**🚢 Deploy (`deploy.yml`)** - Executa em **push na `main`**:
1. **Build** das imagens Docker (frontend + backend)
2. **Push** para Google Artifact Registry
3. **Security scanning** (gcloud artifacts scan)
4. **Deploy** no GKE com kubectl apply
5. **Wait for rollout** (timeout 5min)
6. **Health checks** automáticos
7. **Deployment summary** com IPs, URLs e métricas

### Secrets Necessários (GitHub)

Configure em **Settings > Secrets and variables > Actions**:
```
WIF_PROVIDER           # projects/123/locations/global/workloadIdentityPools/...
WIF_SERVICE_ACCOUNT    # github-actions@project.iam.gserviceaccount.com
GCP_PROJECT_ID         # your-gcp-project-id
DB_HOST                # 10.X.X.X (Cloud SQL private IP)
DB_NAME                # dx03
DB_USER                # postgres
DB_PASSWORD            # strong-password-here
```

**Como obter os valores:**
- `WIF_PROVIDER` e `WIF_SERVICE_ACCOUNT`: Ver [WORKLOAD_IDENTITY_SETUP.md](docs/WORKLOAD_IDENTITY_SETUP.md) no repo tx03
- `DB_HOST`: IP privado do Cloud SQL (console GCP)
- `DB_*`: Credenciais do Cloud SQL

## 🧪 Testing

```bash
# Backend tests (Jest) - quando implementados
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Frontend tests (Vitest) - quando implementados
cd client
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

**Status atual:** Estrutura pronta para testes, implementação futura.

## 📈 Performance

### Métricas de Build
- **Frontend Build Time**: ~15-30s (Vite)
- **Frontend Bundle Size**: ~150KB gzipped
- **Backend Start Time**: ~2-3s (com DB connection)

### Métricas de Runtime
- **Backend Response Time**: < 100ms (média)
- **Database Query Latency**: < 10ms (Cloud SQL)
- **Frontend Load Time**: < 2s (FCP - First Contentful Paint)

### Docker Images
- **Frontend**: ~50MB (Nginx Alpine)
- **Backend**: ~150MB (Node 20 Alpine)
- **PostgreSQL**: ~240MB (official alpine)

### Kubernetes Resources
**Backend Pod:**
- Requests: CPU 100m, Memory 128Mi
- Limits: CPU 500m, Memory 512Mi

**Frontend Pod:**
- Requests: CPU 50m, Memory 64Mi
- Limits: CPU 200m, Memory 256Mi

## 🔗 Projetos Relacionados

### Infraestrutura (Terraform)
- **tx03**: https://github.com/maringelix/tx03
  - Terraform modules para GCP
  - GKE cluster (Autopilot ou Standard)
  - Cloud SQL PostgreSQL (db-f1-micro)
  - Networking (VPC, subnets, NAT)
  - Cloud Armor (WAF policies)
  - Artifact Registry
  - Workload Identity Federation

### Outras Aplicações da Série
- **dx01**: https://github.com/maringelix/dx01 (AWS/EKS)
  - React + Node.js em EKS
  - RDS PostgreSQL
  - ALB + WAF
  
- **dx02**: https://github.com/maringelix/dx02 (Azure/AKS)
  - React + Node.js em AKS
  - Azure SQL Database
  - Application Gateway

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. **Fork** o projeto
2. Crie uma **feature branch** (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: Minha feature incrível'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request** com descrição detalhada

### Guidelines
- Siga os padrões de código existentes (ESLint, Prettier)
- Adicione testes quando relevante
- Atualize a documentação se necessário
- Use commits semânticos (feat, fix, docs, etc)

## 📝 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

**Resumo da Licença MIT:**
- ✅ Uso comercial e privado permitido
- ✅ Modificação permitida
- ✅ Distribuição permitida
- ⚠️ Sem garantias (use por sua conta e risco)
- 📝 Mantenha o aviso de copyright

## 👤 Autor

**maringelix**
- GitHub: [@maringelix](https://github.com/maringelix)
- DX03 App: https://github.com/maringelix/dx03
- TX03 Infrastructure: https://github.com/maringelix/tx03

## 🙏 Agradecimentos

- [Google Cloud Platform](https://cloud.google.com/) - Infraestrutura e documentação
- [React](https://react.dev/) e [Vite](https://vitejs.dev/) - Ferramentas frontend incríveis
- [Node.js](https://nodejs.org/) e [Express](https://expressjs.com/) - Backend robusto
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados confiável
- [Kubernetes](https://kubernetes.io/) - Orquestração de containers
- [Docker](https://www.docker.com/) - Containerização
- Comunidade open-source - Por todo o conhecimento compartilhado

---

**Desenvolvido com ❤️ para fins de aprendizado e demonstração**

*Parte da série de projetos multi-cloud: AWS (tx01/dx01), Azure (tx02/dx02), GCP (tx03/dx03)*
