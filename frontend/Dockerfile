# Multi-stage Dockerfile for React frontend
FROM node:18-alpine as base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Development stage
FROM base as development

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S reactjs && \
    adduser -S reactjs -u 1001

# Change ownership
RUN chown -R reactjs:reactjs /usr/src/app

# Switch to non-root user
USER reactjs

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]

# Build stage for production
FROM base as build

# Set build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_SOCKET_URL
ARG REACT_APP_APP_NAME
ARG REACT_APP_VERSION

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL
ENV REACT_APP_APP_NAME=$REACT_APP_APP_NAME
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:1.25-alpine as production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Copy PWA service worker and manifest
COPY --from=build /usr/src/app/public/sw.js /usr/share/nginx/html/
COPY --from=build /usr/src/app/public/manifest.json /usr/share/nginx/html/
COPY --from=build /usr/src/app/public/offline.html /usr/share/nginx/html/

# Create nginx user and directories
RUN addgroup -g 1001 -S nginx_app && \
    adduser -S nginx_app -u 1001 -G nginx_app

# Set proper permissions
RUN chown -R nginx_app:nginx_app /usr/share/nginx/html && \
    chown -R nginx_app:nginx_app /var/cache/nginx && \
    chown -R nginx_app:nginx_app /var/log/nginx && \
    chown -R nginx_app:nginx_app /etc/nginx/conf.d

# Create pid directory
RUN mkdir -p /var/run/nginx && \
    chown -R nginx_app:nginx_app /var/run/nginx

# Switch to non-root user
USER nginx_app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
