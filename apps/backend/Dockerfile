# Stage 1: Dependencies
FROM node:24-alpine AS base
WORKDIR /app

COPY package.json ./
COPY packages/db/package.json ./packages/db/package.json
COPY apps/backend/package.json ./apps/backend/package.json

RUN npm install

# Stage 2: Dev
FROM base AS dev
WORKDIR /app/apps/backend

EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Stage 3: Builder
FROM base AS builder

COPY packages/db/ ./packages/db/
COPY apps/backend/ ./apps/backend/

RUN npm run build -w @duodev/backend

# Stage 4: Runner
FROM node:24-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

RUN npm install --omit=dev

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/db/ ./packages/db/

EXPOSE 3000
CMD ["node", "apps/backend/dist/main"]
