const bodyParser = require("body-parser");
const Logger = require('../services/Logger');

/**
 * Middleware Configuration
 * Configures Express middleware
 * Follows Single Responsibility Principle
 */
class MiddlewareConfig {
    constructor(app) {
        this.app = app;
        this.logger = Logger;
    }

    /**
     * Configures all middleware
     */
    configure() {
        this.configureBodyParsers();
        this.configureCors();
        this.configureLogging();

        this.logger.info("Middleware configured successfully");
    }

    /**
     * Configures body parsing middleware
     * @private
     */
    configureBodyParsers() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.text({ type: "*/*" }));

        this.logger.debug("Body parsers configured");
    }

    /**
     * Configures CORS headers (if needed)
     * @private
     */
    configureCors() {
        // Add CORS headers if needed
        this.app.use((req, res, next) => {
            // Allow specific origins in production, or configure as needed
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });

        this.logger.debug("CORS headers configured");
    }

    /**
     * Configures request logging middleware
     * @private
     */
    configureLogging() {
        this.app.use((req, res, next) => {
            const start = Date.now();

            res.on('finish', () => {
                const duration = Date.now() - start;
                this.logger.debug(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
            });

            next();
        });

        this.logger.debug("Request logging configured");
    }

    /**
     * Configures error handling middleware
     */
    configureErrorHandling() {
        this.app.use((error, req, res, next) => {
            this.logger.error("Unhandled error", {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method
            });

            res.status(500).json({
                error: "Internal Server Error",
                message: "An unexpected error occurred"
            });
        });

        this.logger.info("Error handling middleware configured");
    }
}

module.exports = MiddlewareConfig;
