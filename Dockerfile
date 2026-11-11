FROM node:lts-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/office/package.json ./apps/office/package.json
COPY third_party/libnumbertext-js ./third_party/libnumbertext-js
RUN npm install --global npm@12.2.2
RUN npm ci --no-audit --no-fund

FROM dependencies AS builder

COPY . .
RUN GOMAXPROCS=1 npm run build:single-threaded --workspace @vite-office/office

FROM nginx:stable-alpine AS runner

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/office/dist /usr/share/nginx/html

EXPOSE 80
