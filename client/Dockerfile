# Build stage
FROM node:20.11.0-alpine3.19@sha256:2f46fd49c767554c089a5eb219115313b72748d8f62f5eccb58ef52bc36db4ad AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (lockfile-driven build)
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build application
RUN npm run build

# Production stage -- unprivileged nginx (runs as user nginx on port 8080, no root)
FROM nginxinc/nginx-unprivileged:1.27.3-alpine@sha256:9e7238f579a54582263a960d1b0094b4a3ecce641342eda3f8e2ff82b1703d2b

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (must listen on 8080 because unprivileged image)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose unprivileged port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Image base already sets USER nginx (uid 101); kept explicit for clarity
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
