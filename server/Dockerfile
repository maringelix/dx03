# Build stage -- needs devDependencies to compile TypeScript
FROM node:23.3.0-alpine3.19@sha256:4ebaf825598cb2f47eb2a52c4a0badf800681b49064e9cae73d3ae7a31a7ee44 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src
RUN npm run build && npm prune --omit=dev

# Production stage
FROM node:23.3.0-alpine3.19@sha256:4ebaf825598cb2f47eb2a52c4a0badf800681b49064e9cae73d3ae7a31a7ee44

WORKDIR /app

COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

USER node

CMD ["node", "dist/server.js"]
