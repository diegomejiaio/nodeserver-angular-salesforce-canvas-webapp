#!/bin/sh
# Check if the Angular files exist
echo "Checking Angular files..."
ls -la /app/front/dist/front/browser || echo "Angular files not found!"

# Check environment variables
echo "Checking environment variables..."
echo "PORT=$PORT"
echo "NODE_ENV=$NODE_ENV"

# Start the application
echo "Starting application..."
exec node app.js
