# Stage 1: Depedencies
FROM node:24.14-alpine AS base
WORKDIR /app

COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN npm install

# Stage 2: Dev
FROM base AS dev
WORKDIR /app/apps/frontend

EXPOSE 3000
CMD [ "npm", "run", "dev", "--", "--host" ]

# Stage 3: Builder
FROM base AS builder

COPY apps/frontend ./apps/frontend
RUN npm run build -w @duodev/frontend

# Stage 4: Runner
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
RUN sed -i 's/listen\s*80;/listen 3000;/g' /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD [ "nginx", "-g", "daemon off;" ]
