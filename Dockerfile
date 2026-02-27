# syntax=docker/dockerfile:1

# 1. build stage
FROM node:20-alpine AS build
WORKDIR /app

# cache deps
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci            # or yarn install --frozen-lockfile

COPY . .
RUN npm run build      # produces /app/dist

# 2. production stage
FROM nginx:alpine
# remove default content
RUN rm -rf /usr/share/nginx/html/*

# copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# add custom nginx.conf for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]