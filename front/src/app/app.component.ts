import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NglModule,
  NglIconsModule,
  NglButtonsModule,
  NglBadgesModule,
  NglSpinnersModule,
  NglToastModule,
} from 'ng-lightning';

/**
 * Main application component that handles Salesforce Canvas integration.
 * Displays user and organization information from the Salesforce Canvas context.
 * 
 * @remarks
 * This component receives data through a globally injected salesforceEnvelope object
 * which contains authenticated user context from Salesforce Canvas signed request.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NglModule, 
    NglIconsModule, 
    NglButtonsModule,
    NglBadgesModule,
    NglSpinnersModule,
    NglToastModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /** Holds the Salesforce Canvas context data */
  envelope: any = null;
  /** Controls the visibility of the success toast */
  showToast = false;
  /** Controls the visibility of the top toast from ng-lightning */
  showTopToast = false;
  /** API endpoint for testing */
  apiEndpoint = '/services/data/v52.0/sobjects/Opportunity/';
  /** API response */
  apiResponse: any = null;
  /** Loading state for API call */
  isLoading = false;
  /** Input validation error message */
  inputError: string | null = null;
  /** Target origin for API calls */
  targetOrigin: string | null = null;

  // APIM Configuration
  /** APIM host for API calls */
  apimHost = 'fs-canvas-webapp-apim-001.azure-api.net';
  /** APIM endpoint for testing */
  apimEndpoint = '/test/ping';
  /** APIM subscription key */
  apimSubscriptionKey = 'd14a60d9e5154bad8857723f5923b660';
  /** HTTP method for the APIM call */
  apimHttpMethod = 'GET';
  /** Available HTTP methods for APIM calls */
  apimHttpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  /** APIM API response */
  apimResponse: any = null;
  /** Loading state for APIM API call */
  isApimLoading = false;
  /** APIM input validation error message */
  apimInputError: string | null = null;
  /** Whether to use server-side proxy for APIM calls */
  useServerProxy = true;
  /** Whether to use server-side proxy for Salesforce calls */
  useSalesforceProxy = false;

  /**
   * Handles toggle changes for the Salesforce proxy
   * Triggered when the user clicks the toggle button
   */
  toggleSalesforceProxy() {
    // Add an immediate visual response
    const checkbox = document.getElementById('salesforce-proxy') as HTMLInputElement;
    if (checkbox) {
      // Add a brief highlight effect to the toggle
      checkbox.classList.add('toggle-clicked');
      setTimeout(() => checkbox.classList.remove('toggle-clicked'), 300);
    }
    
    // Force the value to update in the next change detection cycle
    setTimeout(() => {
      console.log(`Salesforce proxy ${this.useSalesforceProxy ? 'enabled' : 'disabled'}`);
      // Clear any previous response when changing proxy mode
      if (this.apiResponse) {
        this.apiResponse = null;
      }
    }, 0);
  }

  /**
   * Handles toggle changes for the APIM proxy
   * Triggered when the user clicks the toggle button
   */
  toggleServerProxy() {
    // Add an immediate visual response
    const checkbox = document.getElementById('server-proxy') as HTMLInputElement;
    if (checkbox) {
      // Add a brief highlight effect to the toggle
      checkbox.classList.add('toggle-clicked');
      setTimeout(() => checkbox.classList.remove('toggle-clicked'), 300);
    }
    
    // Force the value to update in the next change detection cycle
    setTimeout(() => {
      console.log(`APIM proxy ${this.useServerProxy ? 'enabled' : 'disabled'}`);
      // Clear any previous response when changing proxy mode
      if (this.apimResponse) {
        this.apimResponse = null;
      }
    }, 0);
  }

  /**
   * Handles the close event from the ngl-toast component
   * @param reason The reason why the toast was closed
   */
  onClose(reason: string) {
    console.log(`Closed by ${reason}`);
    this.showTopToast = false;
  }

  ngOnInit() {
    // Check for globally injected Salesforce Canvas data
    if ((window as any).salesforceEnvelope) {
      this.envelope = (window as any).salesforceEnvelope;
      this.targetOrigin = this.envelope.client.targetOrigin.replace('my.salesforce.com', 'lightning.force.com');
      this.showToast = true;
      // Also show the ng-lightning toast
      this.showTopToast = true;
    } else {
      console.log('No Salesforce Canvas data found, loading test data');
      // Load test data for development
      
      // Simulate a signed request payload
      this.envelope = { 
        "algorithm": "HMACSHA256", 
        "issuedAt": -246115464, 
        "userId": "005gL00000dasdas232iC2jQAE", 
        "client": { 
          "refreshToken": null, 
          "instanceId": "_:pep_web_app_2:j_id0:j_id1:canvasapp", 
          "targetOrigin": "https://orgfarm-1ee7d40ed5-dev-ed.develop.my.salesforce.com", 
          "instanceUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.my.salesforce.com", 
          "oauthToken": "dasdasdasdassoyuntokenadsasdasda" 
        }, 
        "context": { 
          "user": { 
            "userId": "005gL000002iC2jQAE", 
            "userName": "dadsasda04@agentforce.com", 
            "firstName": "adsdasdasdas", 
            "lastName": "Mejia", 
            "email": "adsasdasdasdas@adasdasdasd.com", 
            "fullName": "Demo User", 
            "locale": "es_PE", 
            "language": "en_US", 
            "timeZone": "America/Lima", 
            "profileId": "00egL000001efNI", 
            "roleId": null, 
            "userType": "STANDARD", 
            "currencyISOCode": "USD", 
            "profilePhotoUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.file.force.com/profilephoto/005/F", 
            "profileThumbnailUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.file.force.com/profilephoto/005/T", 
            "siteUrl": null, 
            "siteUrlPrefix": null, 
            "networkId": null, 
            "accessibilityModeEnabled": false, 
            "isDefaultNetwork": true 
          }, 
          "links": { 
            "loginUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.my.salesforce.com", 
            "enterpriseUrl": "/services/Soap/c/63.0/00DgL000003KIqH", 
            "metadataUrl": "/services/Soap/m/63.0/00DgL000003KIqH", 
            "partnerUrl": "/services/Soap/u/63.0/00DgL000003KIqH", 
            "restUrl": "/services/data/v63.0/", 
            "sobjectUrl": "/services/data/v63.0/sobjects/", 
            "searchUrl": "/services/data/v63.0/search/", 
            "queryUrl": "/services/data/v63.0/query/", 
            "recentItemsUrl": "/services/data/v63.0/recent/", 
            "chatterFeedsUrl": "/services/data/v31.0/chatter/feeds", 
            "chatterGroupsUrl": "/services/data/v63.0/chatter/groups", 
            "chatterUsersUrl": "/services/data/v63.0/chatter/users", 
            "chatterFeedItemsUrl": "/services/data/v31.0/chatter/feed-items", 
            "userUrl": "/005gL000002iC2jQAE" 
          }, 
          "application": { 
            "name": "pep_web_app_2", 
            "canvasUrl": "https://sfcanvaswebapp002.azurewebsites.net", 
            "applicationId": "06PgL0000004hCr", 
            "version": "1.0", 
            "authType": "SIGNED_REQUEST", 
            "referenceId": "09HgL0000004D3V", 
            "options": [], 
            "samlInitiationMethod": "None", 
            "namespace": "", 
            "isInstalledPersonalApp": false, 
            "developerName": "pep_web_app_2" 
          }, 
          "organization": { 
            "organizationId": "00DgL000003KIqHUAW", 
            "name": "Salesforce Organization", 
            "multicurrencyEnabled": false, 
            "namespacePrefix": null, 
            "currencyIsoCode": "USD" 
          }, 
          "environment": { 
            "referer": null, 
            "locationUrl": "https://orgfarm-1ee7d40ed5-dev-ed--c.develop.vf.force.com/apex/pep_web_app_2?sfdc.tabName=01rgL000004prBI&vfRetURLInSFX=%2Fhome%2Fhome.jsp&ltn_app_id=06mgL000001zOUvQAM&nonce=781140246aa70d20f7445a028ada117961d58edd350d758c5aa59e09f0c7b1a5&sfdcIFrameOrigin=https%3A%2F%2Forgfarm-1ee7d40ed5-dev-ed.develop.lightning.force.com&tour=&isdtp=p1&sfdcIFrameHost=web&clc=0", 
            "displayLocation": "Visualforce", 
            "sublocation": null, 
            "uiTheme": "Theme3", 
            "dimensions": { 
              "width": "100%", 
              "height": "1000px", 
              "maxWidth": "1000px", 
              "maxHeight": "2000px", 
              "clientWidth": "1239px", 
              "clientHeight": "30px" 
            }, 
            "parameters": {}, 
            "record": {}, 
            "version": { 
              "season": "SPRING", 
              "api": "63.0" 
            } 
          } 
        } 
      };
      this.targetOrigin = this.envelope.client.targetOrigin.replace('my.salesforce.com', 'lightning.force.com');
      // Show toast after a delay to simulate loading
      setTimeout(() => {
        this.showToast = true;
        // Also show the ng-lightning toast
        this.showTopToast = true;
      }, 500);
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  }

  /**
   * Closes the success toast notification
   */
  closeToast() {
    this.showToast = false;
  }

  /**
   * Validates the API endpoint before making an API call
   * @returns Whether the API endpoint is valid
   */
  validateApiEndpoint(): boolean {
    if (!this.apiEndpoint) {
      this.inputError = 'API endpoint is required';
      return false;
    }
    
    if (!this.apiEndpoint.startsWith('/services/data/')) {
      this.inputError = 'API endpoint must start with /services/data/';
      return false;
    }
    
    this.inputError = null;
    return true;
  }

  /**
   * Validates the APIM endpoint before making an API call
   * @returns Whether the APIM endpoint is valid
   */
  validateApimEndpoint(): boolean {
    if (!this.apimEndpoint) {
      this.apimInputError = 'APIM endpoint is required';
      return false;
    }
    
    if (!this.apimEndpoint.startsWith('/')) {
      this.apimInputError = 'APIM endpoint must start with /';
      return false;
    }
    
    this.apimInputError = null;
    return true;
  }

  /**
   * Makes an API call to the Salesforce REST API
   */
  async testApiCall() {
    if (!this.envelope?.client?.oauthToken || !this.envelope?.client?.targetOrigin) {
      alert('No OAuth token or target origin available');
      return;
    }
    
    if (!this.validateApiEndpoint()) {
      return;
    }

    // Check if we're using test data
    if (this.isUsingTestData()) {
      const proceed = confirm(`⚠️ WARNING: You're using test data with a fake OAuth token.

This API call will fail because the token is not valid for Salesforce.

To test real Salesforce API calls:
1. Deploy this application to a server
2. Configure it as a Salesforce Canvas app
3. Access it from within Salesforce

Do you want to proceed anyway to see the error response?`);
      
      if (!proceed) {
        return;
      }
    }

    this.isLoading = true;
    this.apiResponse = null;
    
    // Log the proxy mode being used
    console.log(`Making Salesforce API call with ${this.useSalesforceProxy ? 'SERVER PROXY' : 'DIRECT BROWSER CALL'}`);

    try {
      // Ensure the token is properly trimmed
      const cleanToken = this.envelope.client.oauthToken.trim();
      
      if (this.useSalesforceProxy) {
        // Use server-side proxy for Salesforce calls
        const lightningDomain = this.envelope.client.targetOrigin.replace('my.salesforce.com', 'lightning.force.com');
        const url = `${lightningDomain}${this.apiEndpoint}`;
        
        console.log('Using Salesforce proxy for API call');
        console.log('OAuth Token:', cleanToken.substring(0, 20) + '...');
        console.log('Target URL:', url);
        
        const proxyResponse = await fetch('/api/salesforce-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: url,
            method: 'GET',
            token: cleanToken,
            headers: {
              // Set Origin to the same domain as the API call, matching the working request.http pattern
              'Origin': lightningDomain
            }
          })
        });
        
        const data = await proxyResponse.json();
        console.log('Salesforce proxy response:', data);
        
        // Enhanced response handling
        let finalData = data;
        
        // Check for session expired or invalid patterns in the response
        const sessionErrorPatterns = [
          // Check in data array
          Array.isArray(data.data) && data.data.some((item: { errorCode: string; message: string | string[]; }) => 
            item.errorCode === 'INVALID_SESSION_ID' || 
            item.message?.includes('Session expired or invalid')),
          // Check in originalError array
          Array.isArray(data.originalError) && data.originalError.some((item: { errorCode: string; message: string | string[]; }) => 
            item.errorCode === 'INVALID_SESSION_ID' || 
            item.message?.includes('Session expired or invalid')),
          // Check in direct data properties
          data.data?.[0]?.errorCode === 'INVALID_SESSION_ID',
          data.data?.[0]?.message?.includes('Session expired or invalid'),
          // Check JSON string for common patterns
          JSON.stringify(data).includes('INVALID_SESSION_ID') || 
          JSON.stringify(data).includes('Session expired or invalid')
        ];
        
        // Detect if any session error patterns match
        const hasSessionError = sessionErrorPatterns.some(pattern => pattern);
        
        // Case 1: Session invalid - but the token might be valid and Salesforce might have issues
        if (hasSessionError) {
          console.log('Session invalid detected in response');
          
          // Extract error details from response for better debugging
          const errorDetails = (data.data?.length > 0) ? data.data : 
                              (data.originalError?.length > 0) ? data.originalError : data;
          
          // Update UI with diagnostic info and user-friendly message
          finalData = {
            error: 'Salesforce API authentication issue',
            message: 'Your session may need to be refreshed in Salesforce.',
            action: 'try_again',
            actionMessage: 'Please try again or refresh the page if the issue persists.',
            salesforceError: errorDetails,
            tokenInfo: {
              length: this.envelope.client.oauthToken.length,
              prefix: this.envelope.client.oauthToken.substring(0, 10) + '...'
            },
            originalResponse: data
          };
          
          // If running in Salesforce, you could trigger a redirect to login
          if (window.parent && window.parent !== window && !this.isUsingTestData()) {
            console.log('Running in Salesforce iframe - could redirect to re-auth if needed');
            // For safety, we won't auto-redirect, just inform the user
          }
        } 
        // Case 2: Development mode with test data
        else if (proxyResponse.status === 401 && this.isUsingTestData()) {
          finalData = {
            error: 'Authentication failed (expected in development mode)',
            message: 'The fake OAuth token cannot authenticate with real Salesforce APIs. This is normal when running in development mode.',
            salesforceError: data.error || data.data,
            developerNote: 'To test with real data, deploy this app as a Salesforce Canvas app and access it from within Salesforce.',
            testDataMode: true
          };
        }
        // Case 3: Unexpected error in production
        else if (proxyResponse.status === 401) {
          finalData = {
            error: 'Authentication failed with Salesforce API',
            message: 'Failed to authenticate with the Salesforce API.',
            details: 'Your session may have expired or the OAuth token is invalid.',
            action: 'refresh',
            salesforceError: data.data || data.error,
            tokenLength: this.envelope.client.oauthToken.length,
            tokenFirstChars: this.envelope.client.oauthToken.substring(0, 10) + '...'
          };
        }
        
        this.apiResponse = {
          status: proxyResponse.status,
          statusText: proxyResponse.statusText,
          data: finalData,
          proxyUsed: true
        };
      } else {
        // Direct browser-to-Salesforce call
        const lightningDomain = this.envelope.client.targetOrigin.replace('my.salesforce.com', 'lightning.force.com');
        const url = `${lightningDomain}${this.apiEndpoint}`;
        
        console.log('Making direct Salesforce API call to:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json',
            'Origin': this.envelope.context.application.canvasUrl 
          }
        });

        const data = await response.json();
        
        // Enhanced response handling for development mode
        let finalData = data;
        if (!response.ok && this.isUsingTestData()) {
          finalData = {
            error: 'API call failed (expected in development mode)',
            message: 'The fake OAuth token cannot authenticate with real Salesforce APIs. This is normal when running in development mode.',
            salesforceError: data,
            httpStatus: response.status,
            developerNote: 'To test with real data, deploy this app as a Salesforce Canvas app and access it from within Salesforce.',
            testDataMode: true
          };
        }
        
        this.apiResponse = {
          status: response.status,
          statusText: response.statusText,
          data: finalData,
          directBrowserRequest: true
        };
      }
    } catch (error) {
      console.error('Salesforce API call error:', error);
      
      let errorResponse = {
        error: error instanceof Error ? error.message : String(error),
        message: 'Failed to make Salesforce API call',
        stack: error instanceof Error ? error.stack : undefined
      };
      
      // Add development mode context if using test data
      if (this.isUsingTestData()) {
        errorResponse = {
          ...errorResponse,
        };
      }
      
      this.apiResponse = errorResponse;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Makes an API call to the APIM endpoint
   */
  async testApimCall() {
    if (!this.envelope?.client?.oauthToken) {
      alert('No OAuth token available for APIM call');
      return;
    }
    
    if (!this.validateApimEndpoint()) {
      return;
    }

    // Check if we're using test data
    if (this.isUsingTestData()) {
      const proceed = confirm(`⚠️ WARNING: You're using test data with a fake OAuth token.

This APIM call may fail if your APIM endpoint validates the token against Salesforce.

To test real APIM calls with valid tokens:
1. Deploy this application to a server
2. Configure it as a Salesforce Canvas app
3. Access it from within Salesforce

Do you want to proceed anyway?`);
      
      if (!proceed) {
        return;
      }
    }

    this.isApimLoading = true;
    this.apimResponse = null;

    // Log diagnostic information before making the call
    console.log('APIM Call Diagnostics:', this.generateDiagnosticReport());

    try {
      // Ensure the token is properly trimmed
      const cleanToken = this.envelope.client.oauthToken.trim();
      
      let url: string;
      let response: Response;
      
      if (this.useServerProxy) {
        // Call our Node.js server proxy endpoint which will make the APIM call for us
        // This avoids CORS issues as the server-to-server communication isn't subject to browser CORS
        url = `/api/proxy`;
        console.log('Using server proxy for APIM call:', url);
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            apimHost: this.apimHost,
            apimEndpoint: this.apimEndpoint,
            method: this.apimHttpMethod,
            subscriptionKey: this.apimSubscriptionKey,
            token: cleanToken
          })
        });
        
        // Process the response from our server proxy
        const data = await response.json();
        console.log('Server proxy response:', data);
        
        this.apimResponse = {
          status: response.status,
          statusText: response.statusText,
          data: data,
          proxyUsed: true
        };
      } else {
        // Direct browser-to-APIM call (will have CORS issues)
        url = `https://${this.apimHost}${this.apimEndpoint}`;
        
        console.log('Making direct APIM API call to:', url);
        console.log('Using HTTP method:', this.apimHttpMethod);
        console.log('Using OAuth token:', cleanToken.substring(0, 10) + '...');
        
        // Use no-cors mode to prevent CORS preflight (OPTIONS) request
        response = await fetch(url, {
          method: this.apimHttpMethod,
          mode: 'no-cors', // This prevents the preflight OPTIONS request
          credentials: 'omit', // Don't send cookies
          headers: {
            'Ocp-Apim-Subscription-Key': this.apimSubscriptionKey,
            'Authorization': `Bearer ${cleanToken}`,
            'Accept': '*/*'
          }
        });

        let data;
        let status = response.status;
        let statusText = response.statusText;
        
        // In 'no-cors' mode, we get an "opaque" response with limited information
        if (status === 0) {
          // This means the request was sent but we can't see the details due to CORS
          this.apimResponse = {
            status: 'Request sent',
            statusText: 'Response is opaque due to CORS policy',
            data: 'Check the network tab in browser dev tools to see the actual request results',
            directBrowserRequest: true,
            timestamp: new Date().toISOString(),
            diagnostics: {
              url: url,
              method: this.apimHttpMethod,
              mode: 'no-cors'
            }
          };
          console.log('Opaque response received due to CORS policy');
        } else {
          // If we can read the response, process it normally
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }
          
          this.apimResponse = {
            status: status,
            statusText: statusText,
            data: data,
            directBrowserRequest: true
          };
          console.log('Direct browser APIM response:', this.apimResponse);
        }
      }
    } catch (error) {
      console.error('APIM API call error:', error);
      this.apimResponse = {
        error: error instanceof Error ? error.message : String(error),
        message: 'Failed to make APIM API call',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      };
    } finally {
      this.isApimLoading = false;
    }
  }

  /**
   * Switches to server proxy mode and retries the APIM call
   */
  switchToServerProxy() {
    this.useServerProxy = true;
    this.testApimCall();
  }

  /**
   * Opens a dialog with CORS debugging information
   */
  openCorsDebugInfo() {
    // For now, just log to console and show an alert
    console.log('CORS debugging information');
    alert(`CORS Troubleshooting Tips:
    
1. Check if the APIM endpoint supports CORS
2. Verify that your APIM has the following headers enabled:
   - Access-Control-Allow-Origin: * (or your specific origin)
   - Access-Control-Allow-Methods: GET, POST, OPTIONS, etc.
   - Access-Control-Allow-Headers: Authorization, Content-Type, etc.

3. Consider using the server proxy option which avoids CORS issues
4. Check browser console and network tab for detailed error messages`);
  }

  /**
   * Generates a diagnostic report for APIM calls
   * @returns A formatted string with diagnostic information
   */
  generateDiagnosticReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      apimConfig: {
        host: this.apimHost,
        endpoint: this.apimEndpoint,
        method: this.apimHttpMethod,
        usingProxy: this.useServerProxy
      },
      salesforceContext: {
        targetOrigin: this.targetOrigin,
        restUrl: this.envelope?.context?.links?.restUrl,
        hasOAuthToken: !!this.envelope?.client?.oauthToken
      },
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language
      }
    };
    
    return JSON.stringify(report, null, 2);
  }

  /**
   * Logs diagnostic report to console
   */
  logDiagnosticReport() {
    console.log('APIM Diagnostic Report:', this.generateDiagnosticReport());
  }

  /**
   * Gets the user agent string from the browser
   * @returns The user agent string
   */
  getUserAgent(): string {
    return navigator.userAgent;
  }

  /**
   * Checks if we're using test data (development mode)
   * @returns True if using test data, false if using real Salesforce Canvas data
   */
  isUsingTestData(): boolean {
    return this.envelope?.client?.oauthToken === 'dasdasdasdassoyuntokenadsasdasda';
  }
}