# Frontend multi-stage build: build React app and serve with nginx

############################
# Build stage
############################
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --silent

# Copy source and build
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

############################
# Production stage
############################
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# Custom nginx config to enable SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
