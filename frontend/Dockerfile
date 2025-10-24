# --- dev ---
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 5173
CMD ["npm","run","dev","--","--host","--port","5173"]

# --- builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

# --- nginx static ---
FROM nginx:1.27-alpine AS nginx_static
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80