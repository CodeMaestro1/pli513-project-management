# Stage 1: Build with Bun
FROM oven/bun:1 AS build
WORKDIR /app

# Cache dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source AFTER deps
COPY . .
RUN bun run build

# Stage 2: Nginx
FROM nginx:alpine

# Remove default config if needed
# RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
