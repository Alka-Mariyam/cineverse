# Stage 1: Build the Vite React App
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# When building for production inside docker, we just point the API URL to itself so Nginx proxies it
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the built React app to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
