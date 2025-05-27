const express = require("express");
const Logger = require('../services/Logger');

/**
 * Route Registry
 * Manages application routes and their bindings
 * Follows Single Responsibility Principle and Dependency Inversion Principle
 */
class RouteRegistry {
    constructor(app) {
        this.app = app;
        this.logger = Logger;
    }

    /**
     * Registers Canvas-related routes
     * @param {CanvasController} canvasController - Canvas controller instance
     */
    registerCanvasRoutes(canvasController) {
        // Health check endpoint
        this.app.get("/health", (req, res) => canvasController.handleHealthCheck(req, res));

        // Canvas signed request endpoint
        this.app.post("/", (req, res) => canvasController.handleCanvasRequest(req, res));

        this.logger.info("Canvas routes registered");
    }

    /**
     * Registers Proxy-related routes
     * @param {ProxyController} proxyController - Proxy controller instance
     */
    registerProxyRoutes(proxyController) {
        // APIM proxy endpoint
        this.app.post("/api/proxy", (req, res) => proxyController.handleApimProxy(req, res));

        // Salesforce proxy endpoint
        this.app.post("/api/salesforce-proxy", (req, res) => proxyController.handleSalesforceProxy(req, res));

        this.logger.info("Proxy routes registered");
    }

    /**
     * Registers static file serving
     * @param {AngularStaticService} angularStaticService - Angular static service
     */
    registerStaticRoutes(angularStaticService) {
        // Serve Angular static files
        this.app.use(express.static(angularStaticService.getDistPath()));

        // SPA fallback route (must be last)
        this.app.get(/.*/, (req, res) => {
            const indexPath = angularStaticService.getIndexPath();
            res.sendFile(indexPath);
            this.logger.debug(`SPA route fallback: ${req.url} -> index.html`);
        });

        this.logger.info("Static routes registered");
    }

    /**
     * Registers all application routes
     * @param {Object} controllers - Object containing all controllers
     * @param {AngularStaticService} angularStaticService - Angular static service
     */
    registerAllRoutes(controllers, angularStaticService) {
        this.registerCanvasRoutes(controllers.canvasController);
        this.registerProxyRoutes(controllers.proxyController);
        this.registerStaticRoutes(angularStaticService);

        this.logger.info("All routes registered successfully");
    }
}

module.exports = RouteRegistry;
