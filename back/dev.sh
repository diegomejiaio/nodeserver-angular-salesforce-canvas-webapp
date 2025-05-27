#!/bin/sh
# Set environment variables for development
export PORT=3000
export NODE_ENV=development

# Print environment info
echo "Starting in development mode..."
echo "PORT=$PORT"
echo "NODE_ENV=$NODE_ENV"

# Start the application with nodemon for auto-restart
exec nodemon app.js
