# Salesforce Canvas Integration - Angular + Node.js

A full-stack application that demonstrates Salesforce Canvas integration using Node.js (Express) backend and Angular frontend. This application securely handles Salesforce Canvas signed requests and displays user information within Salesforce.

## Features

- Salesforce Canvas Integration
- Secure request handling with HMAC SHA-256
- Angular 17+ with standalone components
- Docker containerization support
- Azure deployment ready
- TypeScript support
- Environment configuration

## Project Structure

```
/
├── back/              # Backend source (Node.js/Express)
│   ├── app.js        # Main server file
│   └── views/        # View templates
├── front/            # Frontend source (Angular)
│   ├── src/         # Angular source code
│   └── dist/        # Build output
├── .env.example     # Environment variables template
├── .gitignore      # Git ignore rules
├── deploy.sh       # Azure deployment script
├── Dockerfile      # Docker configuration
└── README.md       # Documentation
```

## Sequence Flow

```mermaid
sequenceDiagram
    participant SF as Salesforce
    participant Node as Node.js Server
    participant Angular as Angular App
    participant User as User

    SF->>Node: 1. POST / with signed_request
    Note over Node: 2. Validates HMAC signature
    Node->>Node: 3. Decodes base64 envelope
    Node->>Angular: 4. Injects envelope as window.salesforceEnvelope
    Angular->>Angular: 5. Initializes with envelope data
    Angular->>User: 6. Displays user context & organization info
    User->>Angular: 7. Interacts with UI
    Angular->>SF: 8. Displays within Salesforce Canvas iframe
```

## Prerequisites

- Node.js >= 18.x
- npm >= 8.x
- Angular CLI
- Docker (for containerization)
- Azure CLI (for cloud deployment)
- Salesforce Developer Account

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/diegomejiaio/nodeserver-angular-salesforce-canvas-webapp.git
   cd nodeserver-angular-salesforce-canvas-webapp
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Install backend dependencies:
   ```bash
   cd back
   npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd ../front
   npm install
   ```

## Development Environment

### Running the Backend
```bash
cd back
npm run dev
```

### Running the Frontend
```bash
cd front
ng serve
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000

## Docker Deployment

Build and run the application using Docker:

```bash
docker build -t sf-canvas-angular .
docker run -p 3000:3000 -e CANVAS_CONSUMER_SECRET=your_secret sf-canvas-angular
```

## Azure Deployment

1. Ensure Azure CLI is installed and you're logged in:
   ```bash
   az login
   ```

2. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

The script will:
- Create/use Azure Container Registry (ACR)
- Build and push the Docker image
- Create an App Service Plan
- Deploy to Azure App Service
- Configure environment variables


## Environment Variables

Required environment variables in `.env`:

- `CANVAS_CONSUMER_SECRET`: Salesforce Canvas consumer secret
- `PORT`: Server port (defaults: 3000 for development, 80 for production)


## Security

- Implements HMAC SHA-256 signature validation for Salesforce Canvas requests
- Uses secure environment variables for sensitive data
- Implements proper CORS and security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a Pull Request

## License

MIT

## Support

For issues and feature requests, please use the GitHub issue tracker.