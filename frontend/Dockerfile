FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy custom nginx config if we had one, but we can just use the default and copy files
COPY --from=builder /app/dist /usr/share/nginx/html
# Add a simple nginx config to handle SPA routing (fallback to index.html)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://gateway-service:8080; \
    } \
    location /uploads { \
        proxy_pass http://gateway-service:8080; \
    } \
    location /ws { \
        proxy_pass http://gateway-service:8080; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade \$http_upgrade; \
        proxy_set_header Connection \"upgrade\"; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
