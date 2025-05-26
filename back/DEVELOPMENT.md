# Local Development Setup

This guide will help you run the application in development mode without needing to build a Docker image.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Setup Steps

1. Make sure you have the frontend built:
   ```
   cd ../front
   npm install
   npm run build
   ```

2. Setup backend:
   ```
   cd ../back
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` if not already exists
   - Fill in the required values in `.env`

4. Run the development server:
   ```
   npm run dev
   ```

5. The server will start on port 3000:
   - Backend: http://localhost:3000
   - API endpoints will be available at their respective paths

## Development Features

- Server runs on port 3000 by default
- Uses nodemon for auto-restart on file changes
- Serves the Angular frontend from the `/front/dist` folder
- Automatically checks if Angular build exists before starting

## Notes

- Any changes to backend files will trigger an automatic server restart
- For frontend changes, you need to rebuild the Angular app with `npm run build` in the front directory
- To test with Salesforce Canvas, you'll need to expose your local server (e.g., using ngrok) and update your Canvas app settings
