# Use a multi-stage build to optimize the image size

# --- Base Stage: Node.js for building ---
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
COPY package.json .
COPY package-lock.json .

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the .env file if it doesn't exist
RUN if [ ! -f .env ]; then echo "Generating empty .env file"; touch .env; fi

# Build the application (adjust command as needed)
RUN npm run build

# --- Production Stage: Nginx for serving static files ---
FROM nginx:alpine AS production

# Copy the build output from the builder stage
COPY --from=builder /app/web-build /usr/share/nginx/html

# Copy the nginx configuration file (if you have one)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Set environment variables (example)
ENV NODE_ENV production

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]