const crypto = require("crypto");
const Logger = require('./Logger');

/**
 * Canvas Authentication Service
 * Handles Salesforce Canvas signature validation and request processing
 * Follows Single Responsibility Principle
 */
class CanvasAuthService {
    constructor(consumerSecret) {
        this.consumerSecret = consumerSecret;
        this.logger = Logger;
    }

    /**
     * Validates and processes a signed request from Salesforce Canvas
     * @param {Object} requestBody - The request body containing signed_request
     * @returns {Object} - Parsed envelope data
     * @throws {Error} - If validation fails
     */
    validateSignedRequest(requestBody) {
        const signedRequest = this.extractSignedRequest(requestBody);
        this.logger.debug("Processing signed request", { signedRequest: signedRequest.substring(0, 50) + "..." });

        const [consumerSecret, encodedEnvelope] = this.parseSignedRequest(signedRequest);

        if (!this.verifySignature(consumerSecret, encodedEnvelope)) {
            throw new Error('Invalid signature - authentication failed');
        }

        return this.decodeEnvelope(encodedEnvelope);
    }

    /**
     * Extracts signed_request from various request body formats
     * @private
     */
    extractSignedRequest(requestBody) {
        let signedRequest;

        if (typeof requestBody === "string" && requestBody.includes(".")) {
            signedRequest = requestBody;
            if (signedRequest.startsWith("signed_request=")) {
                signedRequest = signedRequest.slice("signed_request=".length);
            }
        } else if (requestBody && requestBody.signed_request) {
            signedRequest = requestBody.signed_request;
        } else {
            throw new Error("Missing signed_request in body");
        }

        // Decode if URL encoded
        if (signedRequest.includes("%2F") || signedRequest.includes("%3D")) {
            signedRequest = decodeURIComponent(signedRequest);
        }

        return signedRequest;
    }

    /**
     * Parses the signed request into its components
     * @private
     */
    parseSignedRequest(signedRequest) {
        const bodyArray = signedRequest.split(".");

        if (bodyArray.length !== 2) {
            throw new Error(`Invalid signed_request format (expected 2 parts, got ${bodyArray.length})`);
        }

        return [bodyArray[0], bodyArray[1]];
    }

    /**
     * Verifies the HMAC signature
     * @private
     */
    verifySignature(receivedSignature, encodedEnvelope) {
        const calculatedSignature = crypto
            .createHmac("sha256", this.consumerSecret)
            .update(encodedEnvelope)
            .digest("base64");

        this.logger.debug("Signature verification", {
            received: receivedSignature,
            calculated: calculatedSignature,
            match: calculatedSignature === receivedSignature
        });

        return calculatedSignature === receivedSignature;
    }

    /**
     * Decodes the envelope from base64
     * @private
     */
    decodeEnvelope(encodedEnvelope) {
        try {
            const envelope = JSON.parse(Buffer.from(encodedEnvelope, "base64").toString("utf8"));
            this.logger.info("Canvas authentication successful", {
                userId: envelope.context?.user?.userId,
                orgId: envelope.context?.organization?.organizationId
            });
            return envelope;
        } catch (error) {
            throw new Error(`Failed to decode envelope: ${error.message}`);
        }
    }
}

module.exports = CanvasAuthService;
