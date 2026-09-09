FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/office/package.json ./apps/office/package.json
RUN npm ci

FROM dependencies AS builder

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/office/dist /usr/share/nginx/html

EXPOSE 80
