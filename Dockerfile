# Use a multi-stage build to optimize image size

# --- Stage 1: Install dependencies and build the app ---
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml if applicable)
COPY package.json .

# Install dependencies.  Prioritize detecting the package manager.
RUN if [ -f "yarn.lock" ]; then yarn install --frozen-lockfile; \
    elif [ -f "pnpm-lock.yaml" ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
    else npm install; fi

# Copy the rest of the application code (only necessary files)
COPY . .

# Build the application (assuming it's a web app that needs building)
# Modify this based on your actual build process.  If it's just a Node.js API, you might skip this.
# This example assumes a React Native Web build.  Adjust accordingly.
RUN npm run web

# --- Stage 2: Serve the app with nginx (or Node.js if it's an API) ---
FROM nginx:alpine AS production

# Copy the build output from the builder stage
COPY --from=builder /app/web-build /usr/share/nginx/html

# Copy nginx configuration (if you have one, otherwise use the default)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (or the port your app uses)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]