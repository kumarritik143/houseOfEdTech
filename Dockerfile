# Use a Node.js base image for the build stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the application (if necessary, adjust the command)
# For Expo, this might involve building the web version
# Or prebuilding assets for faster startup
RUN npm run web

# Use a lightweight base image for the production stage
FROM nginx:alpine

# Copy the build output from the builder stage
COPY --from=builder /app/web-build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]