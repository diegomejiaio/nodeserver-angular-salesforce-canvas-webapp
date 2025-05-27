/**
 * Main Application Entry Point
 * 
 */

const express = require("express");

// Configuration and Container
const AppConfig = require('./src/config/AppConfig');
const DIContainer = require('./src/container/DIContainer');

// Infrastructure
const MiddlewareConfig = require('./src/middleware/MiddlewareConfig');
const RouteRegistry = require('./src/routes/RouteRegistry');

// Utilities
const Logger = require('./src/services/Logger');

/**
 * Application class that orchestrates the entire application
 * Follows Single Responsibility Principle
 */
class Application {
    constructor() {
        this.app = express();
        this.logger = Logger;
        this.initialized = false;
    }

    /**
     * Initializes the application
     */
    async initialize() {
        try {
            this.logger.info("Initializing Salesforce Canvas Application...");

            // Load and validate configuration
            this.config = new AppConfig();
            this.logger.info("Configuration loaded successfully");

            // Initialize dependency injection container
            this.container = new DIContainer(this.config);
            this.container.initialize();
            this.logger.info("Dependency injection container initialized");

            // Configure middleware
            this.middlewareConfig = new MiddlewareConfig(this.app);
            this.middlewareConfig.configure();

            // Register routes
            this.routeRegistry = new RouteRegistry(this.app);
            this.routeRegistry.registerAllRoutes(
                this.container.getAllControllers(),
                this.container.getService('angularStaticService')
            );

            // Configure error handling (should be last)
            this.middlewareConfig.configureErrorHandling();

            // Validate Angular build exists
            this.validateAngularBuild();

            this.initialized = true;
            this.logger.info("Application initialized successfully");
        } catch (error) {
            this.logger.error("Failed to initialize application", error);
            throw error;
        }
    }

    /**
     * Validates that Angular build exists
     * @private
     */
    validateAngularBuild() {
        const angularService = this.container.getService('angularStaticService');
        if (!angularService.validateBuildExists()) {
            this.logger.warn("Angular build not found. Make sure to build the frontend first.");
        } else {
            this.logger.info("Angular build validated successfully");
        }
    }

    /**
     * Starts the HTTP server
     */
    async start() {
        if (!this.initialized) {
            await this.initialize();
        }

        const port = this.config.getPort();

        return new Promise((resolve) => {
            this.server = this.app.listen(port, "0.0.0.0", () => {
                this.logger.info(`🚀 Server started successfully`, {
                    port: port,
                    environment: this.config.getNodeEnv(),
                    angularPath: this.container.getService('angularStaticService').getDistPath(),
                    timestamp: new Date().toISOString()
                });
                resolve(this.server);
            });
        });
    }

    /**
     * Gracefully stops the server
     */
    async stop() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    this.logger.info("Server stopped gracefully");
                    resolve();
                });
            });
        }
    }

    /**
     * Gets the Express app instance
     * @returns {Express} - Express application
     */
    getApp() {
        return this.app;
    }

    /**
     * Gets the dependency injection container
     * @returns {DIContainer} - DI container
     */
    getContainer() {
        return this.container;
    }
}

// Create and start the application
const app = new Application();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    Logger.info('SIGTERM received, shutting down gracefully');
    await app.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    Logger.info('SIGINT received, shutting down gracefully');
    await app.stop();
    process.exit(0);
});

// Start the application
app.start().catch((error) => {
    Logger.error('Failed to start application', error);
    process.exit(1);
});

module.exports = app;
