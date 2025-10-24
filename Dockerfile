# Use a Node.js base image for building the application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
COPY package.json ./

# Install dependencies.  Prefer 'npm ci' for production builds.
ARG NODE_ENV=development
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --only=production; else npm install; fi

# Copy the application source code
COPY . .

# Build the application.  Adjust the build command as needed.
RUN npm run build

# Use a smaller base image for serving the application
FROM nginx:alpine

# Copy the built application from the builder stage
COPY --from=builder /app/web-build /usr/share/nginx/html

# Copy the nginx configuration file (if you have one)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]