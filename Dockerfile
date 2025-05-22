# Build stage for Angular frontend
FROM node:20-bullseye AS build-front
WORKDIR /front

# Copy package files and install dependencies with legacy-peer-deps to handle version conflicts
COPY front/package*.json ./
RUN npm config set legacy-peer-deps true && \
    npm install

# Copy Angular source
COPY front/ ./

# Build the Angular app in production mode with increased memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build -- --configuration=production

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies for backend
COPY back/package*.json ./
RUN npm config set legacy-peer-deps true && \
    npm install --only=production

# Copy backend application code
COPY back/ ./

# Create directory structure for Angular files
RUN mkdir -p front/dist/front/browser

# Copy built frontend from build stage
COPY --from=build-front /front/dist/front/browser ./front/dist/front/browser

# Set environment variables
ENV PORT=80
ENV NODE_ENV=production

# Expose the port
EXPOSE 80

# Start the application
CMD ["node", "app.js"]