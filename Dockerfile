# syntax=docker/dockerfile:1

# --- deps: cai full dependencies (co devDeps de build) ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# --- dev: vite dev server, source mount qua compose override ---
# node_modules o / (ngoai bind-mount /app) de source mount khong che khuat.
FROM node:22-alpine AS dev
ENV NODE_ENV=development
WORKDIR /
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- build: tsc + vite build -> dist/ (VITE_API_URL nhung luc nay) ---
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: vite preview serve dist qua npm run start ---
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/vite.config.ts ./vite.config.ts
USER node
EXPOSE 6666
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:6666/ >/dev/null 2>&1 || exit 1
CMD ["npm", "run", "start"]
