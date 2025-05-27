const Logger = require('../services/Logger');

/**
 * Canvas Controller
 * Handles Salesforce Canvas requests and responses
 * Follows Single Responsibility Principle
 */
class CanvasController {
    constructor(canvasAuthService, azureAuthService, angularStaticService) {
        this.canvasAuthService = canvasAuthService;
        this.azureAuthService = azureAuthService;
        this.angularStaticService = angularStaticService;
        this.logger = Logger;
    }

    /**
     * Handles POST requests to root endpoint for Canvas signed requests
     */
    async handleCanvasRequest(req, res) {
        try {
            this.logger.info("Processing Canvas signed request", {
                headers: req.headers,
                bodyType: typeof req.body
            });

            // Validate and decode the signed request
            const envelope = this.canvasAuthService.validateSignedRequest(req.body);

            // Enrich envelope with Azure token if available
            const enrichedEnvelope = await this.enrichEnvelopeWithAzureToken(envelope);

            // Generate response with injected envelope
            const html = await this.angularStaticService.injectEnvelopeIntoIndex(enrichedEnvelope);

            res.send(html);
            this.logger.info("Canvas request processed successfully");
        } catch (error) {
            this.logger.error("Error processing Canvas request", error);
            return res.status(400).send(`Error processing signed_request: ${error.message}`);
        }
    }

    /**
     * Enriches envelope with Azure AD token
     * @private
     */
    async enrichEnvelopeWithAzureToken(envelope) {
        if (this.azureAuthService.isConfigured()) {
            try {
                const azureToken = await this.azureAuthService.acquireToken();
                envelope.token_azure = azureToken;
                this.logger.info("Azure token added to envelope");
            } catch (error) {
                this.logger.error("Error acquiring Azure token", error);
                envelope.token_azure = null;
            }
        } else {
            this.logger.warn("Azure authentication not configured");
            envelope.token_azure = null;
        }

        return envelope;
    }

    /**
     * Handles health check requests
     */
    handleHealthCheck(req, res) {
        this.logger.debug("Health check requested");
        res.status(200).send("Service is healthy");
    }
}

module.exports = CanvasController;
