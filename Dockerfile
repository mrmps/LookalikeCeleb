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
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./

# Copy public assets that the server might need to serve
COPY --from=builder /app/public ./public

# Expose server port
ENV PORT=3001
EXPOSE 3001

# Start the Hono server with tsx
CMD ["npx", "tsx", "server/index.ts"] 