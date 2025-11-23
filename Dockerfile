# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install root dependencies
RUN npm ci

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Install client dependencies and build
WORKDIR /app/client
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built client
COPY --from=builder /app/client/build ./client/build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/monitoring/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
WORKDIR /app/server
CMD ["node", "index.js"]

