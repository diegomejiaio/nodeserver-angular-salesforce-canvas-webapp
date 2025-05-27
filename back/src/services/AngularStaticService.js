const path = require("path");
const fs = require("fs");
const Logger = require('./Logger');

/**
 * Angular Static Files Service
 * Handles serving Angular application and file operations
 * Follows Single Responsibility Principle
 */
class AngularStaticService {
    constructor(config) {
        this.config = config;
        this.logger = Logger;
        this.angularDistPath = this.determineAngularPath();
    }

    /**
     * Determines the correct path for Angular dist files
     * @private
     */
    determineAngularPath() {
        const distPath = this.config.isDevelopment()
            ? path.join(__dirname, "../../../front/dist/front/browser")  // Development path
            : path.join(__dirname, "../front/dist/front/browser");    // Production path


        this.logger.info(`Angular files will be served from: ${distPath}`);
        return distPath;
    }

    /**
     * Gets the path to the Angular dist directory
     * @returns {string} - Path to Angular dist
     */
    getDistPath() {
        return this.angularDistPath;
    }

    /**
     * Gets the path to index.html
     * @returns {string} - Path to index.html
     */
    getIndexPath() {
        return path.join(this.angularDistPath, "index.html");
    }

    /**
     * Reads and modifies index.html with envelope injection
     * @param {Object} envelope - Salesforce envelope data
     * @returns {Promise<string>} - Modified HTML content
     */
    async injectEnvelopeIntoIndex(envelope) {
        try {
            const indexPath = this.getIndexPath();
            const html = await this.readFileAsync(indexPath);

            return this.injectScriptIntoHtml(html, envelope);
        } catch (error) {
            this.logger.error("Error processing index.html", error);
            throw new Error(`Error loading Angular app: ${error.message}`);
        }
    }

    /**
     * Injects envelope data as a script into HTML
     * @private
     */
    injectScriptIntoHtml(html, envelope) {
        const script = `<script>
            console.log('Salesforce envelope injected into window object');
            window.salesforceEnvelope = ${JSON.stringify(envelope)};
        </script>
        </body>`;

        return html.replace("</body>", script);
    }

    /**
     * Reads file asynchronously using promises
     * @private
     */
    readFileAsync(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Validates that Angular build exists
     * @returns {boolean} - True if build exists
     */
    validateBuildExists() {
        const indexPath = this.getIndexPath();
        const exists = fs.existsSync(indexPath);

        if (!exists) {
            this.logger.warn(`Angular build not found at: ${indexPath}`);
        }

        return exists;
    }
}

module.exports = AngularStaticService;
