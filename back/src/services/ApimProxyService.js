const BaseProxyService = require('./BaseProxyService');

/**
 * APIM Proxy Service
 * Handles Azure API Management proxy requests
 * Extends BaseProxyService following Open/Closed Principle
 */
class ApimProxyService extends BaseProxyService {
    constructor() {
        super();
    }

    /**
     * Makes a proxy request to Azure API Management
     * @param {Object} requestData - Request configuration
     * @returns {Object} - Response object
     */
    async makeRequest(requestData) {
        const { apimHost, apimEndpoint, method, subscriptionKey, token } = requestData;

        // Validate APIM-specific parameters
        this.validateApimParams(apimHost, apimEndpoint, subscriptionKey);
        this.validateCommonParams(apimEndpoint, method, token);

        const normalizedToken = this.normalizeToken(token);
        const url = `https://${apimHost}${apimEndpoint}`;

        this.logger.info(`Proxying ${method} request to APIM`, {
            host: apimHost,
            endpoint: apimEndpoint,
            tokenLength: normalizedToken.length
        });

        const headers = this.buildApimHeaders(subscriptionKey, normalizedToken);

        try {
            const response = await this.executeRequest({
                method: method.toLowerCase(),
                url: url,
                headers: headers
            });

            this.logger.info(`APIM response received`, { status: response.status });
            return this.buildResponse(response);
        } catch (error) {
            this.logger.error("APIM proxy request failed", error);
            throw new Error(`APIM proxy error: ${error.message}`);
        }
    }

    /**
     * Validates APIM-specific parameters
     * @private
     */
    validateApimParams(apimHost, apimEndpoint, subscriptionKey) {
        if (!apimHost || !apimEndpoint || !subscriptionKey) {
            throw new Error("Missing APIM parameters: apimHost, apimEndpoint, and subscriptionKey are required");
        }
    }

    /**
     * Builds headers for APIM requests
     * @private
     */
    buildApimHeaders(subscriptionKey, token) {
        return {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
            'Content-Type': 'application/json'
        };
    }
}

module.exports = ApimProxyService;
