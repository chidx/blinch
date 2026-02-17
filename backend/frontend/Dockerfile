# Frontend Dockerfile
FROM node:25.6.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:25.6.1-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S blinch && \
    adduser -S blinch -u 1001 -G blinch

# Copy necessary files
COPY --from=builder --chown=blinch:blinch /app/public ./public
COPY --from=builder --chown=blinch:blinch /app/package*.json ./
COPY --from=builder --chown=blinch:blinch /app/.next/standalone ./
COPY --from=builder --chown=blinch:blinch /app/.next/static ./.next/static

# Switch to non-root user
USER blinch

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start server
CMD ["node", "server.js"]
