# Salesforce Canvas Backend - Node.js Server

A robust Node.js backend server for Salesforce Canvas integration.

## 🏗️ Architecture Overview

This backend follows **SOLID principles** with a modular architecture that separates concerns into focused, testable components:

```
src/
├── config/          # Configuration management
├── services/        # Business logic services
├── controllers/     # HTTP request handlers
├── middleware/      # Express middleware
├── routes/          # Route definitions
└── container/       # Dependency injection
```

## 🚀 Features

- **Salesforce Canvas Integration**: Secure handling of Canvas signed requests
- **Azure Integration**: Azure AD authentication and API Management proxy
- **SOLID Architecture**: Modular, testable, and maintainable codebase
- **Dependency Injection**: Clean separation of concerns
- **Comprehensive Logging**: Centralized logging with different levels
- **Error Handling**: Robust error handling and validation
- **Static File Serving**: Serves Angular frontend build
- **Docker Ready**: Containerization support
- **Azure Deployment**: Production-ready for Azure App Service

## 📋 Prerequisites

- **Node.js**: v14 or higher
- **npm**: Latest version
- **Angular Frontend**: Built frontend in `../front/dist/` folder

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
cd back
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values:
# - CANVAS_CONSUMER_SECRET: Your Salesforce Canvas app secret
# - AZURE_CLIENT_ID: Azure AD app client ID
# - AZURE_TENANT_ID: Azure AD tenant ID
# - AZURE_CLIENT_SECRET: Azure AD app secret
# - APIM_URL: Azure API Management URL
# - APIM_KEY: Azure APIM subscription key
# - PORT: Server port (default: 3000)
# - NODE_ENV: Environment (development/production)
```

### 3. Build Frontend (Required)
```bash
# Ensure Angular frontend is built
cd ../front
npm install
npm run build
cd ../back
```

## 🔧 Running the Server

### Development Mode
```bash
npm run dev
# or
./dev.sh
```

### Production Mode
```bash
npm start
```

### SOLID Architecture (New)
```bash
# Run the new SOLID implementation
npm run start:solid
npm run dev:solid
```

## 📡 API Endpoints

### Canvas Endpoints
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| `POST` | `/` | Handle Salesforce Canvas signed requests | `CanvasController` |
| `GET` | `/health` | Health check endpoint | `CanvasController` |

### Proxy Endpoints
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| `POST` | `/api/proxy` | Azure APIM proxy for CORS handling | `ProxyController` |
| `POST` | `/api/salesforce-proxy` | Salesforce API proxy | `ProxyController` |

### Static Routes
| Method | Endpoint | Description | Service |
|--------|----------|-------------|---------|
| `GET` | `/*` | Serve Angular static files | `AngularStaticService` |
| `GET` | `/.*` | SPA fallback route to index.html | `AngularStaticService` |

## 🏛️ Architecture Components

### Controllers
Handle HTTP requests and coordinate business logic:

#### `CanvasController.js`
- Validates Salesforce Canvas signed requests
- Extracts user and organization data
- Handles HMAC SHA-256 signature verification
- Returns user information to frontend

#### `ProxyController.js`
- **APIM Proxy**: Routes requests to Azure API Management
- **Salesforce Proxy**: Handles Salesforce API calls with proper authentication
- **CORS Handling**: Solves cross-origin issues for browser requests

### Services
Core business logic implementations:

#### Authentication Services
- **`CanvasAuthService.js`**: Salesforce Canvas authentication and signature validation
- **`AzureAuthService.js`**: Azure AD integration and token management

#### Proxy Services
- **`BaseProxyService.js`**: Abstract base class for proxy implementations
- **`ApimProxyService.js`**: Azure API Management proxy logic
- **`SalesforceProxyService.js`**: Salesforce REST API proxy

#### Utility Services
- **`Logger.js`**: Centralized logging with different levels
- **`AngularStaticService.js`**: Static file serving for Angular frontend

### Configuration
- **`AppConfig.js`**: Environment configuration management with validation

### Middleware
- **`MiddlewareConfig.js`**: Express middleware setup (body parsing, CORS, logging, error handling)

### Routing
- **`RouteRegistry.js`**: Centralized route management and registration

### Dependency Injection
- **`DIContainer.js`**: Manages service dependencies and lifecycle

## 🔒 Security Features

### Canvas Security
- **HMAC SHA-256 Verification**: Validates authentic Salesforce requests
- **Signed Request Validation**: Ensures requests come from authorized Salesforce orgs
- **Token Extraction**: Safely extracts OAuth tokens from Canvas context

### API Security
- **Bearer Token Authentication**: Uses Salesforce OAuth tokens for API calls
- **CORS Protection**: Configurable CORS headers
- **Request Validation**: Input validation and sanitization

## 🌐 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` |
| `PORT` | No | Server port | `3000` |
| `CANVAS_CONSUMER_SECRET` | Yes | Salesforce Canvas app secret | `your_secret_here` |
| `AZURE_CLIENT_ID` | Yes | Azure AD app client ID | `guid-here` |
| `AZURE_TENANT_ID` | Yes | Azure AD tenant ID | `guid-here` |
| `AZURE_CLIENT_SECRET` | Yes | Azure AD app secret | `secret_here` |
| `APIM_URL` | No | Azure APIM base URL | `https://myapim.azure-api.net` |
| `APIM_KEY` | No | APIM subscription key | `subscription_key_here` |

## 📊 Logging

The application uses a centralized logging system with different levels:

```javascript
Logger.info("Application started");
Logger.warn("Angular build not found");
Logger.error("Failed to authenticate", error);
Logger.debug("Processing request", requestData);
```

Logs include:
- **Timestamp**: ISO format timestamps
- **Level**: INFO, WARN, ERROR, DEBUG
- **Context**: Additional metadata for debugging
- **Request Tracking**: Trace requests through the system

## 🔄 Request Flow

```
1. Browser/Salesforce → Express Server
2. MiddlewareConfig → Request processing
3. RouteRegistry → Route matching
4. Controller → Request handling
5. Service → Business logic
6. Response → Back to client
```

### Canvas Request Flow
```
Salesforce Canvas → POST / → CanvasController → CanvasAuthService → User Data Response
```

### API Proxy Flow
```
Frontend → POST /api/proxy → ProxyController → ApimProxyService → Azure APIM → Response
Frontend → POST /api/salesforce-proxy → ProxyController → SalesforceProxyService → Salesforce API → Response
```

## 🧪 Testing

### Validation Script
```bash
node test-solid.js
```

### Manual Testing
1. **Health Check**: `GET /health`
2. **Canvas Request**: POST to `/` with signed request
3. **APIM Proxy**: POST to `/api/proxy` with APIM details
4. **Salesforce Proxy**: POST to `/api/salesforce-proxy` with SF API details

## 🐳 Docker Support

### Build Image
```bash
docker build -t salesforce-canvas-backend .
```

### Run Container
```bash
docker run -p 3000:3000 -e CANVAS_CONSUMER_SECRET=your_secret salesforce-canvas-backend
```

## 🌊 Deployment

### Azure App Service
```bash
# Use the provided deployment script
./deploy.sh

# Or manually deploy
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name myAppName \
  --src deploy.zip
```

### Environment Setup for Production
- Set all required environment variables in Azure App Service Configuration
- Ensure frontend is built and included in deployment package
- Configure custom domain and SSL certificates
- Set up Application Insights for monitoring

## 🔍 Debugging

### Development Debugging
```bash
# Enable debug logging
NODE_ENV=development npm run dev

# Check logs for detailed request flow
# Logs show: configuration, middleware, routes, service calls
```

### Common Issues
1. **Angular build missing**: Ensure `../front/dist/` exists
2. **Canvas signature validation fails**: Check `CANVAS_CONSUMER_SECRET`
3. **CORS issues**: Use proxy endpoints instead of direct browser calls
4. **Azure auth fails**: Verify Azure AD configuration

## 📚 Dependencies

### Core Dependencies
- **express**: Web framework
- **@azure/msal-node**: Azure AD authentication
- **axios**: HTTP client for API calls
- **crypto-js**: Cryptographic functions
- **base64-url**: URL-safe base64 encoding
- **dotenv**: Environment variable management

### Development Dependencies
- **nodemon**: Development auto-restart

## 🤝 Contributing

1. Follow SOLID principles when adding new features
2. Add new services to the DI container
3. Use the Logger service for all logging
4. Add appropriate error handling
5. Update this README for new endpoints or features

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check logs with `Logger` output
- Use `/health` endpoint for basic connectivity
- Review SOLID architecture documentation in `SOLID-ARCHITECTURE.md`
- Compare with original implementation using `COMPARISON.md`

---

**Note**: This backend is designed to work with the Angular frontend in the `../front/` directory. Ensure the frontend is built before starting the server.
