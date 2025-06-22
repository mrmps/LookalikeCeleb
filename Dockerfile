# ---- Build stage ----
FROM oven/bun:1.1 AS builder
WORKDIR /app

# Install system dependencies (none needed for bun/elysia)

# Copy project files
COPY . .

# Install Node/Bun dependencies
RUN bun install --frozen-lockfile

# Build the React client (outputs to ./dist)
RUN bun run build

# Compile the Elysia server to a single JS file for production
RUN bun build --compile --minify-syntax --minify-whitespace \
  server/index.ts --outfile server.js

# ---- Production stage ----
FROM oven/bun:1.1-slim AS runner
WORKDIR /app

# Copy compiled artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose server port
ENV PORT=3001
EXPOSE 3001

CMD ["bun", "server.js"] 