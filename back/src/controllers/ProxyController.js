const Logger = require('../services/Logger');

/**
 * Proxy Controller
 * Handles API proxy requests for APIM and Salesforce
 * Follows Single Responsibility Principle
 */
class ProxyController {
    constructor(apimProxyService, salesforceProxyService) {
        this.apimProxyService = apimProxyService;
        this.salesforceProxyService = salesforceProxyService;
        this.logger = Logger;
    }

    /**
     * Handles APIM proxy requests
     */
    async handleApimProxy(req, res) {
        try {
            this.logger.info("Processing APIM proxy request");

            const response = await this.apimProxyService.makeRequest(req.body);

            return res.status(response.status).json(response);
        } catch (error) {
            this.logger.error("APIM proxy error", error);
            return res.status(500).json({
                error: "APIM proxy server error",
                message: error.message || "Unknown error in APIM proxy"
            });
        }
    }

    /**
     * Handles Salesforce API proxy requests
     */
    async handleSalesforceProxy(req, res) {
        try {
            this.logger.info("Processing Salesforce proxy request");

            const response = await this.salesforceProxyService.makeRequest(req.body);

            return res.status(response.status).json(response);
        } catch (error) {
            this.logger.error("Salesforce proxy error", error);
            return res.status(500).json({
                error: "Salesforce proxy server error",
                message: error.message || "Unknown error in Salesforce proxy"
            });
        }
    }
}

module.exports = ProxyController;
