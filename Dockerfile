# ─────────────── 1) Dependencies stage ───────────────
FROM oven/bun:1.1 AS deps
WORKDIR /app

# Copy lock‑files first so “bun install” is cached unless deps change
COPY bun.lockb package*.json ./
RUN bun install --production --no-save

# ─────────────── 2) Build stage ───────────────
FROM deps AS builder
# Bring in the full source
COPY . .

# Build the React client → ./dist
RUN bun run build

# Compile server TypeScript once (quicker cold‑starts)
RUN bun build ./server/index.ts --outdir ./.build/server --target bun

# ─────────────── 3) Runtime stage ───────────────
FROM oven/bun:1.1-slim AS runner
WORKDIR /app

# Copy production deps and built artefacts only
COPY --from=deps    /app/node_modules           ./node_modules
COPY --from=builder /app/dist                  ./dist
COPY --from=builder /app/.build/server         ./server
COPY --from=builder /app/public                ./public
COPY package.json .

# Run as an unprivileged UID
RUN adduser --system --uid 1001 appuser && \
    chown -R appuser:appuser /app
USER appuser

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s CMD \
  curl -f http://localhost:$PORT/health || exit 1

CMD ["bun", "run", "server/index.js"]
