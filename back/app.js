if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const msal = require("@azure/msal-node");
const axios = require("axios");

const app = express();

// Configuración de MSAL para autenticación de Azure AD
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const consumerSecretApp = process.env.CANVAS_CONSUMER_SECRET;
if (!consumerSecretApp) {
  console.error('Error: CANVAS_CONSUMER_SECRET environment variable is required for Salesforce Canvas authentication');
  process.exit(1);
}
console.log("Salesforce Canvas authentication configured");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: "*/*" }));

// Health check endpoint for Azure App Service
app.get("/health", (req, res) => {
  console.log("Health check called");
  res.status(200).send("Service is healthy");
});

const angularDistPath = process.env.NODE_ENV === 'development' 
  ? path.join(__dirname, "../front/dist/front/browser")  // Use relative path to front/dist for development
  : path.join(__dirname, "front/dist/front/browser");    // Use path as in Docker for production
app.use(express.static(angularDistPath));

// POST /: recibe el signed_request Canvas
app.post("/", async function (req, res) {
  try {
    let signedRequest;
    // Logging incoming body and headers for debug
    console.log("===== Incoming POST / =====");
    console.log("Headers:", req.headers);
    console.log("Raw body:", req.body);

    if (typeof req.body === "string" && req.body.includes(".")) {
      signedRequest = req.body;
      // Remover 'signed_request=' si viene así
      if (signedRequest.startsWith("signed_request=")) {
        console.log("Prefijo 'signed_request=' detectado, eliminando...");
        signedRequest = signedRequest.slice("signed_request=".length);
      }
      console.log("signedRequest (string, prefijo eliminado si existía):", signedRequest);
    } else if (req.body && req.body.signed_request) {
      signedRequest = req.body.signed_request;
      console.log("signedRequest (JSON property):", signedRequest);
    } else {
      console.error("Missing signed_request in body. Body:", req.body);
      return res.status(400).send("Missing signed_request");
    }

    // Decode if URL encoded
    if (signedRequest.includes("%2F") || signedRequest.includes("%3D")) {
      console.log("URL encoding detectado, decodificando...");
      signedRequest = decodeURIComponent(signedRequest);
      console.log("signedRequest (decodificado):", signedRequest);
    }

    const bodyArray = signedRequest.split(".");
    console.log("bodyArray:", bodyArray);

    if (bodyArray.length !== 2) {
      console.error("Formato inválido en signed_request (split no da 2 partes). bodyArray:", bodyArray);
      return res.status(400).send("Invalid signed_request format");
    }
    const consumerSecret = bodyArray[0];
    const encoded_envelope = bodyArray[1];

    // Logging consumerSecret and encoded_envelope
    console.log("consumerSecret (hash recibido):", consumerSecret);
    console.log("encoded_envelope (base64 recibido):", encoded_envelope);

    // Logging CANVAS_CONSUMER_SECRET
    console.log("CANVAS_CONSUMER_SECRET usado para HMAC:", consumerSecretApp);

    const check = crypto
      .createHmac("sha256", consumerSecretApp)
      .update(encoded_envelope)
      .digest("base64");

    // Logging HMAC comparison
    console.log("HMAC calculado:", check);
    console.log("Comparando contra consumerSecret recibido:", consumerSecret);
    if (check === consumerSecret) {
      console.log("Autenticación exitosa. Decodificando envelope...");
      const envelope = JSON.parse(Buffer.from(encoded_envelope, "base64").toString("utf8"));
      console.log("Envelope decodificado:", envelope);

      // Obtener token de Azure AD y agregarlo al envelope
      try {
        const pca = new msal.ConfidentialClientApplication(msalConfig);
        const response = await pca.acquireTokenByClientCredential({
          scopes: [`api://${process.env.AZURE_CLIENT_ID}/.default`],
        });
        envelope.token_azure = response.accessToken;
        console.log("Token Azure agregado al envelope");
      } catch (error) {
        console.error("Error obteniendo token Azure:", error);
        envelope.token_azure = null;
      }

      const indexPath = path.join(angularDistPath, "index.html");
      fs.readFile(indexPath, "utf8", (err, html) => {
        if (err) {
          console.error("Error leyendo index.html:", err);
          return res.status(500).send("Error loading Angular app");
        }
        const injectedHtml = html.replace(
          "</body>",
          `<script>
            window.salesforceEnvelope = ${JSON.stringify(envelope)};
            
            // Try to get session ID from Visualforce if available
            if (typeof window.parent !== 'undefined' && window.parent.Sfdc) {
              try {
                // This only works if we're in a Visualforce context
                window.salesforceEnvelope.sessionId = window.parent.Sfdc.canvas.oauth.sessionId;
                console.log('Session ID extracted from Visualforce context');
              } catch (e) {
                console.log('Could not extract session ID from Visualforce context:', e.message);
              }
            }
          </script></body>`
        );
        res.send(injectedHtml);
      });
    } else {
      console.error("Fallo de autenticación. HMAC no coincide.");
      return res.status(401).send(
        "Authentication failed. Invalid signed_request.\n" +
        "Secret (from request): " + consumerSecret + "\n" +
        "Calculated (server): " + check + "\n" +
        "Envelope (base64): " + encoded_envelope + "\n" +
        "CANVAS_CONSUMER_SECRET (server): " + consumerSecretApp + "\n"
      );
    }
  } catch (err) {
    console.error("Error procesando signed_request:", err);
    return res.status(400).send("Error processing signed_request: " + err);
  }
});

// API Proxy endpoint for APIM calls to avoid CORS issues
app.post("/api/proxy", async (req, res) => {
  try {
    const { apimHost, apimEndpoint, method, subscriptionKey, token } = req.body;
    
    if (!apimHost || !apimEndpoint || !method || !subscriptionKey || !token) {
      return res.status(400).json({ 
        error: "Missing required parameters", 
        message: "All parameters (apimHost, apimEndpoint, method, subscriptionKey, token) are required" 
      });
    }
    
    // Normalize the token by trimming any whitespace
    const normalizedToken = token.trim();
    
    console.log(`Proxying ${method} request to ${apimHost}${apimEndpoint}`);
    console.log(`Token length: ${normalizedToken.length}, starts with: ${normalizedToken.substring(0, 5)}...`);
    
    // Build the URL and headers for the APIM request
    const url = `https://${apimHost}${apimEndpoint}`;
    const headers = {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Authorization': `Bearer ${normalizedToken}`,
      'Accept': '*/*',
      'Content-Type': 'application/json'
    };
    
    // Make the request to APIM
    const response = await axios({
      method: method.toLowerCase(),
      url: url,
      headers: headers,
      validateStatus: () => true // Don't throw on any status code
    });
    
    // Log the response status
    console.log(`APIM response status: ${response.status}`);
    
    // Send back the APIM response
    return res.status(response.status).json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    console.error("Error in proxy request:", error);
    return res.status(500).json({
      error: "Proxy server error",
      message: error.message || "Unknown error in proxy"
    });
  }
});

// Salesforce API Proxy endpoint to improve reliability and handle CORS issues
app.post("/api/salesforce-proxy", async (req, res) => {
  try {
    const { url, method, token, headers: additionalHeaders, data: requestData } = req.body;
    
    if (!url || !method || !token) {
      return res.status(400).json({ 
        error: "Missing required parameters", 
        message: "All parameters (url, method, token) are required" 
      });
    }
    
    // Normalize the token by trimming any whitespace
    const normalizedToken = token.trim();
    
    // Verify token looks like a real Salesforce OAuth token (starts with 00D)
    // Real Salesforce tokens typically start with "00D" followed by alphanumeric chars
    const isLikelyValidToken = normalizedToken.startsWith('00D') && normalizedToken.length >= 15;
    console.log(`Token appears to be ${isLikelyValidToken ? 'a valid' : 'an INVALID'} Salesforce OAuth token`);
    
    console.log(`Proxying ${method} request to Salesforce: ${url}`);
    console.log(`Token length: ${normalizedToken.length}, starts with: ${normalizedToken.substring(0, 5)}...`);
    
    // Build the headers for the Salesforce request - keep minimal to match working request.http
    const headers = {
      'Authorization': `Bearer ${normalizedToken}`,
      'Accept': 'application/json',
      // Only add additional headers if they're explicitly provided
      ...(additionalHeaders || {})
    };
    
    // Remove Content-Type for GET requests (it's not needed and might cause issues)
    if (method.toLowerCase() === 'get') {
      delete headers['Content-Type'];
    } else {
      headers['Content-Type'] = 'application/json';
    }
    
    // Remove null/undefined values from headers
    Object.keys(headers).forEach(key => {
      if (headers[key] === null || headers[key] === undefined) {
        delete headers[key];
      }
    });
    
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    
    // Make the request to Salesforce
    const response = await axios({
      method: method.toLowerCase(),
      url: url,
      headers: headers,
      data: requestData, // Include request body if provided
      validateStatus: () => true // Don't throw on any status code
    });
    
    // Log the response status and some response details
    console.log(`Salesforce response status: ${response.status}`);
    if (response.status === 401) {
      console.log('401 Unauthorized response from Salesforce');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      // More robust detection of Salesforce's "Session expired or invalid" error pattern
      const hasInvalidSessionError = 
        // Format 1: Array of error objects
        (Array.isArray(response.data) && response.data.some(err => err.errorCode === 'INVALID_SESSION_ID')) ||
        // Format 2: Array in data property
        (Array.isArray(response.data?.data) && response.data.data.some(err => err.errorCode === 'INVALID_SESSION_ID')) || 
        // Format 3: Direct error property
        response.data?.error === 'INVALID_SESSION_ID' ||
        // Format 4: First element has errorCode
        response.data?.[0]?.errorCode === 'INVALID_SESSION_ID' ||
        // Format 5: Text match for the common message
        JSON.stringify(response.data).includes('Session expired or invalid');
      
      if (hasInvalidSessionError) {
        console.log('Invalid session detected. Providing detailed error response');
        
        // Send back the raw response for better debugging
        return res.status(200).json({
          status: 401,
          statusText: "Unauthorized - But Response Forwarded",
          message: "Salesforce reports 'Session expired or invalid', but we're returning 200 to allow client-side handling",
          originalError: response.data,
          headers: response.headers,
          data: response.data
        });
      }
    }
    
    // Handle successful responses correctly
    if (response.status >= 200 && response.status < 300) {
      console.log('Successful Salesforce response');
      
      // For successful responses, return the data directly with status 200
      return res.status(200).json({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
    }
    
    // For error responses other than authentication issues we already handled
    return res.status(response.status).json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    console.error("Error in Salesforce proxy request:", error);
    return res.status(500).json({
      error: "Salesforce proxy server error",
      message: error.message || "Unknown error in Salesforce proxy"
    });
  }
});

// Fallback seguro para SPA (Express 5.x): expresión regular
app.get(/.*/, function(req, res) {
  res.sendFile(path.join(angularDistPath, "index.html"));
  console.log(`SPA route fallback: ${req.url} -> index.html`);
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function () {
  console.log(`Server is listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Angular files serving from: ${angularDistPath}`);
});