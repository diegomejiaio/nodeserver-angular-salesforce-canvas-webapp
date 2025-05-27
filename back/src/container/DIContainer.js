// Service Dependencies
const CanvasAuthService = require('../services/CanvasAuthService');
const AzureAuthService = require('../services/AzureAuthService');
const ApimProxyService = require('../services/ApimProxyService');
const SalesforceProxyService = require('../services/SalesforceProxyService');
const AngularStaticService = require('../services/AngularStaticService');

// Controller Dependencies
const CanvasController = require('../controllers/CanvasController');
const ProxyController = require('../controllers/ProxyController');

/**
 * Dependency Injection Container
 * Manages application dependencies and their instantiation
 * Follows Dependency Inversion Principle and Single Responsibility Principle
 */
class DIContainer {
    constructor(config) {
        this.config = config;
        this.services = new Map();
        this.controllers = new Map();
        this.initialized = false;
    }

    /**
     * Initializes all services and controllers
     */
    initialize() {
        if (this.initialized) {
            return;
        }

        this.initializeServices();
        this.initializeControllers();
        this.initialized = true;
    }

    /**
     * Initializes all services
     * @private
     */
    initializeServices() {
        // Core services
        this.services.set('canvasAuthService', new CanvasAuthService(
            this.config.getSalesforceConfig().consumerSecret
        ));

        this.services.set('azureAuthService', new AzureAuthService(
            this.config.getAzureConfig()
        ));

        this.services.set('apimProxyService', new ApimProxyService());

        this.services.set('salesforceProxyService', new SalesforceProxyService());

        this.services.set('angularStaticService', new AngularStaticService(this.config));
    }

    /**
     * Initializes all controllers with their dependencies
     * @private
     */
    initializeControllers() {
        this.controllers.set('canvasController', new CanvasController(
            this.services.get('canvasAuthService'),
            this.services.get('azureAuthService'),
            this.services.get('angularStaticService')
        ));

        this.controllers.set('proxyController', new ProxyController(
            this.services.get('apimProxyService'),
            this.services.get('salesforceProxyService')
        ));
    }

    /**
     * Gets a service by name
     * @param {string} serviceName - Name of the service
     * @returns {Object} - Service instance
     */
    getService(serviceName) {
        if (!this.initialized) {
            this.initialize();
        }

        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service '${serviceName}' not found`);
        }
        return service;
    }

    /**
     * Gets a controller by name
     * @param {string} controllerName - Name of the controller
     * @returns {Object} - Controller instance
     */
    getController(controllerName) {
        if (!this.initialized) {
            this.initialize();
        }

        const controller = this.controllers.get(controllerName);
        if (!controller) {
            throw new Error(`Controller '${controllerName}' not found`);
        }
        return controller;
    }

    /**
     * Gets all controllers as an object
     * @returns {Object} - Object containing all controllers
     */
    getAllControllers() {
        if (!this.initialized) {
            this.initialize();
        }

        const controllerObject = {};
        for (const [name, controller] of this.controllers) {
            controllerObject[name] = controller;
        }
        return controllerObject;
    }

    /**
     * Gets all services as an object
     * @returns {Object} - Object containing all services
     */
    getAllServices() {
        if (!this.initialized) {
            this.initialize();
        }

        const serviceObject = {};
        for (const [name, service] of this.services) {
            serviceObject[name] = service;
        }
        return serviceObject;
    }
}

module.exports = DIContainer;
