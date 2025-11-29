# ---------- 1. Build stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy necessary files to install deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web
COPY .env ./apps/web

RUN corepack enable && pnpm install --filter web --frozen-lockfile

# Build only web app
RUN pnpm turbo run build --filter=web

# ---------- 2. Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Copy built output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

CMD ["pnpm", "run", "db:generate"]
CMD ["pnpm", "run", "db:migrate"]
CMD ["node", "apps/web/server.js"]
