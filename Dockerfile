# Use a Node.js base image for building the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
COPY package.json ./

# Install dependencies.  Prefer 'npm ci' in production for reproducibility
ARG NODE_ENV=development
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --only=production; else npm install; fi

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use a smaller base image for running the application (nginx for serving static content)
FROM nginx:alpine

# Copy the built application from the builder stage
COPY --from=builder /app/web-build /usr/share/nginx/html

# Copy the nginx configuration file
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]