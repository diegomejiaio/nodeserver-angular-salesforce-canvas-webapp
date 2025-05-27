const msal = require("@azure/msal-node");
const Logger = require('./Logger');

/**
 * Azure Authentication Service
 * Handles Azure AD token acquisition using MSAL
 * Follows Single Responsibility Principle
 */
class AzureAuthService {
    constructor(azureConfig) {
        this.msalConfig = {
            auth: {
                clientId: azureConfig.clientId,
                authority: `https://login.microsoftonline.com/${azureConfig.tenantId}`,
                clientSecret: azureConfig.clientSecret,
            },
        };
        this.pca = new msal.ConfidentialClientApplication(this.msalConfig);
        this.logger = Logger;
    }

    /**
     * Acquires an Azure AD access token
     * @returns {Promise<string|null>} - Access token or null if failed
     */
    async acquireToken() {
        try {
            const response = await this.pca.acquireTokenByClientCredential({
                scopes: [`api://${this.msalConfig.auth.clientId}/.default`],
            });

            this.logger.info("Azure token acquired successfully");
            return response.accessToken;
        } catch (error) {
            this.logger.error("Error acquiring Azure token", error);
            return null;
        }
    }

    /**
     * Validates if Azure configuration is complete
     * @returns {boolean} - True if configuration is valid
     */
    isConfigured() {
        return !!(this.msalConfig.auth.clientId &&
            this.msalConfig.auth.authority &&
            this.msalConfig.auth.clientSecret);
    }
}

module.exports = AzureAuthService;
