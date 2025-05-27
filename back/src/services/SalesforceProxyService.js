const BaseProxyService = require('./BaseProxyService');

/**
 * Salesforce Proxy Service
 * Handles Salesforce API proxy requests with enhanced error handling
 * Extends BaseProxyService following Open/Closed Principle
 */
class SalesforceProxyService extends BaseProxyService {
    constructor() {
        super();
    }

    /**
     * Makes a proxy request to Salesforce API
     * @param {Object} requestData - Request configuration
     * @returns {Object} - Response object with enhanced error handling
     */
    async makeRequest(requestData) {
        const { url, method, token, headers: additionalHeaders, data: requestBody } = requestData;

        this.validateCommonParams(url, method, token);

        const normalizedToken = this.normalizeToken(token);

        // Validate token format for Salesforce
        this.validateSalesforceToken(normalizedToken);

        this.logger.info(`Proxying ${method} request to Salesforce`, {
            url: url.substring(0, 50) + "...",
            tokenLength: normalizedToken.length,
            isValidToken: this.isLikelyValidSalesforceToken(normalizedToken)
        });

        const headers = this.buildSalesforceHeaders(normalizedToken, method, additionalHeaders);

        try {
            const response = await this.executeRequest({
                method: method.toLowerCase(),
                url: url,
                headers: headers,
                data: requestBody
            });

            this.logger.info(`Salesforce response received`, { status: response.status });

            // Handle authentication errors specially
            if (response.status === 401) {
                return this.handleAuthenticationError(response);
            }

            // Handle successful responses
            if (response.status >= 200 && response.status < 300) {
                return this.buildSuccessResponse(response);
            }

            return this.buildResponse(response);
        } catch (error) {
            this.logger.error("Salesforce proxy request failed", error);
            throw new Error(`Salesforce proxy error: ${error.message}`);
        }
    }

    /**
     * Validates Salesforce token format
     * @private
     */
    validateSalesforceToken(token) {
        if (!this.isLikelyValidSalesforceToken(token)) {
            this.logger.warn("Token does not appear to be a valid Salesforce OAuth token");
        }
    }

    /**
     * Checks if token looks like a valid Salesforce OAuth token
     * @private
     */
    isLikelyValidSalesforceToken(token) {
        return token.startsWith('00D') && token.length >= 15;
    }

    /**
     * Builds headers for Salesforce requests
     * @private
     */
    buildSalesforceHeaders(token, method, additionalHeaders) {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            ...(additionalHeaders || {})
        };

        // Set Content-Type for non-GET requests
        if (method.toLowerCase() !== 'get') {
            headers['Content-Type'] = 'application/json';
        }

        // Remove null/undefined values
        Object.keys(headers).forEach(key => {
            if (headers[key] == null) {
                delete headers[key];
            }
        });

        return headers;
    }

    /**
     * Handles authentication errors with detailed analysis
     * @private
     */
    handleAuthenticationError(response) {
        this.logger.warn("401 Unauthorized response from Salesforce", response.data);

        const hasInvalidSessionError = this.detectInvalidSessionError(response.data);

        if (hasInvalidSessionError) {
            this.logger.info('Invalid session detected, providing detailed error response');

            return {
                status: 200, // Return 200 to allow client-side handling
                statusText: "Unauthorized - But Response Forwarded",
                message: "Salesforce reports 'Session expired or invalid', but we're returning 200 to allow client-side handling",
                originalError: response.data,
                headers: response.headers,
                data: response.data
            };
        }

        return this.buildResponse(response);
    }

    /**
     * Detects various formats of invalid session errors
     * @private
     */
    detectInvalidSessionError(responseData) {
        return (
            // Format 1: Array of error objects
            (Array.isArray(responseData) && responseData.some(err => err.errorCode === 'INVALID_SESSION_ID')) ||
            // Format 2: Array in data property
            (Array.isArray(responseData?.data) && responseData.data.some(err => err.errorCode === 'INVALID_SESSION_ID')) ||
            // Format 3: Direct error property
            responseData?.error === 'INVALID_SESSION_ID' ||
            // Format 4: First element has errorCode
            responseData?.[0]?.errorCode === 'INVALID_SESSION_ID' ||
            // Format 5: Text match for the common message
            JSON.stringify(responseData).includes('Session expired or invalid')
        );
    }

    /**
     * Builds response for successful requests
     * @private
     */
    buildSuccessResponse(response) {
        this.logger.info('Successful Salesforce response');
        return {
            status: 200,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        };
    }
}

module.exports = SalesforceProxyService;
