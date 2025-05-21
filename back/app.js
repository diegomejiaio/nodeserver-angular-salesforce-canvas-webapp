const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

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

const angularDistPath = path.join(__dirname, "front/dist/front/browser");
app.use(express.static(angularDistPath));

// POST /: recibe el signed_request Canvas
app.post("/", function (req, res) {
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

// Fallback seguro para SPA (Express 5.x): expresión regular
app.get(/.*/, function(req, res) {
  res.sendFile(path.join(angularDistPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server is listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Angular files serving from: ${angularDistPath}`);
});