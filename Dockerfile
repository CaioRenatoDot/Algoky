# syntax=docker/dockerfile:1.7
# Imagem única: a API Fastify serve o frontend estático e persiste no SQLite em /data.

ARG NODE_VERSION=24

# ---------------------------------------------------------------- build
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app

# Só os manifests primeiro, para aproveitar o cache de camadas do npm ci.
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --no-audit --no-fund

COPY tsconfig.base.json ./
COPY packages packages
COPY apps apps
RUN npm run build

# ------------------------------------------------------- dependências prod
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --workspace @algoky/api --ignore-scripts --no-audit --no-fund

# -------------------------------------------------------------- runtime
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333 \
    DATABASE_PATH=/data/algoky.db \
    WEB_DIST=/app/web
WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/package.json ./package.json
COPY --from=build --chown=node:node /app/apps/api/dist ./dist
COPY --from=build --chown=node:node /app/apps/api/scripts/backup.mjs ./scripts/backup.mjs
COPY --from=build --chown=node:node /app/apps/web/dist ./web

RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" >/dev/null || exit 1

CMD ["node", "--enable-source-maps", "dist/index.js"]
