# Build stage for Angular frontend
FROM node:20-alpine AS build-front
WORKDIR /front
COPY front/package*.json ./
RUN npm ci
COPY front/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY back/package*.json ./
RUN npm ci --only=production

# Copy backend application code
COPY back/ ./

# Create directory structure for Angular files
RUN mkdir -p front/dist/front/browser

# Copy built frontend from build stage
COPY --from=build-front /front/dist/front/browser ./front/dist/front/browser

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]