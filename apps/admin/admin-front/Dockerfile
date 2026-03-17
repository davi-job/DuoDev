# Stage 1: Dependencies
FROM node:24-alpine AS base
WORKDIR /app

COPY package.json ./
COPY apps/admin/admin-front/package.json ./apps/admin/admin-front/package.json

RUN npm install

# Stage 2: Dev
FROM base AS dev
WORKDIR /app/apps/admin/admin-front

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 3: Builder
FROM base AS builder

COPY apps/admin/admin-front/ ./apps/admin/admin-front/
RUN npm run build -w admin-front

# Stage 4: Runner
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/admin/admin-front/dist /usr/share/nginx/html
RUN sed -i 's/listen\s*80;/listen 3000;/g' /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
