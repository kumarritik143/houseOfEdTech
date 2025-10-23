# Use a Node.js base image for building the application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy the source code into the container
COPY . .

# Build the React application (adjust command as needed)
RUN npm run build

# Use a lightweight Nginx image to serve the static files
FROM nginx:alpine

# Copy the build output from the builder stage to the Nginx web server directory
COPY --from=builder /app/web-build /usr/share/nginx/html

# Copy the Nginx configuration file (if you have one)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]