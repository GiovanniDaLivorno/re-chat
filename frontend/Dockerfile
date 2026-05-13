# syntax=docker/dockerfile:1

# 1️⃣ Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./ 
RUN npm ci

# Copy frontend code and build
COPY . .
RUN npm run build    # generates /app/dist

# 2️⃣ Production stage
FROM node:20-alpine

# Install serve to serve the static files
RUN npm install -g serve

# Copy built frontend assets
COPY --from=build /app/dist /app/dist

# Expose port 80
EXPOSE 80

# Start the server
CMD ["serve", "-s", "/app/dist", "-l", "80"]