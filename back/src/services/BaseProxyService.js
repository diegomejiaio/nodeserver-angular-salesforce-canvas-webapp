const axios = require("axios");
const Logger = require('./Logger');

/**
 * Abstract base class for HTTP proxy services
 * Follows Open/Closed Principle and Liskov Substitution Principle
 */
class BaseProxyService {
    constructor() {
        this.logger = Logger;
    }

    /**
     * Abstract method for making proxy requests
     * Must be implemented by subclasses
     */
    async makeRequest(requestData) {
        throw new Error("makeRequest method must be implemented by subclass");
    }

    /**
     * Validates common request parameters
     * @protected
     */
    validateCommonParams(url, method, token) {
        if (!url || !method || !token) {
            throw new Error("Missing required parameters: url, method, and token are required");
        }
    }

    /**
     * Normalizes token by trimming whitespace
     * @protected
     */
    normalizeToken(token) {
        return token.trim();
    }

    /**
     * Builds standard response object
     * @protected
     */
    buildResponse(response) {
        return {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        };
    }

    /**
     * Makes HTTP request with axios
     * @protected
     */
    async executeRequest(config) {
        return await axios({
            ...config,
            validateStatus: () => true // Don't throw on any status code
        });
    }
}

module.exports = BaseProxyService;
