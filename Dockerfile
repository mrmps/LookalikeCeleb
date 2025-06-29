# ---- Build stage ----
FROM oven/bun:1.1 AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json bun.lockb ./

# Install dependencies (remove --frozen-lockfile to allow lockfile updates)
RUN bun install

# Copy project files
COPY . .

# Build the React client (outputs to ./dist)
RUN bun run build

# ---- Production stage ----
FROM oven/bun:1.1-slim AS runner
WORKDIR /app

# Install Node.js for @hono/node-server
# RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./

# Copy public assets that the server might need to serve
COPY --from=builder /app/public ./public

# Set production environment so Hono serves static files
ENV NODE_ENV=production
# Don't set PORT - let Railway set it

# Expose server port (default, can be overridden by environment)
EXPOSE 3001

# Start the Hono server which will serve both API and React app
CMD ["bun", "run", "server/index.ts"] 