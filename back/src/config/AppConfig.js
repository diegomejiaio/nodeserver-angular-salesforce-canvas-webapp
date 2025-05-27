/**
 * Application Configuration
 * Handles all configuration loading and validation
 * Follows Single Responsibility Principle
 */
class AppConfig {
    constructor() {
        this.loadConfig();
        this.validateConfig();
    }

    loadConfig() {
        if (process.env.NODE_ENV !== 'production') {
            require('dotenv').config();
        }

        this.config = {
            port: process.env.PORT || 3000,
            nodeEnv: process.env.NODE_ENV || 'development',
            azure: {
                clientId: process.env.AZURE_CLIENT_ID,
                tenantId: process.env.AZURE_TENANT_ID,
                clientSecret: process.env.AZURE_CLIENT_SECRET,
            },
            salesforce: {
                consumerSecret: process.env.CANVAS_CONSUMER_SECRET,
            }
        };
    }

    validateConfig() {
        if (!this.config.salesforce.consumerSecret) {
            throw new Error('CANVAS_CONSUMER_SECRET environment variable is required for Salesforce Canvas authentication');
        }
    }

    get(key) {
        return this.getNestedProperty(this.config, key);
    }

    getNestedProperty(obj, key) {
        return key.split('.').reduce((o, k) => o && o[k], obj);
    }

    getPort() {
        return this.config.port;
    }

    getNodeEnv() {
        return this.config.nodeEnv;
    }

    getAzureConfig() {
        return this.config.azure;
    }

    getSalesforceConfig() {
        return this.config.salesforce;
    }

    isDevelopment() {
        return this.config.nodeEnv === 'development';
    }

    isProduction() {
        return this.config.nodeEnv === 'production';
    }
}

module.exports = AppConfig;
