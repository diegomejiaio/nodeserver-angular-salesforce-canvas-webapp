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
  apiEndpoint = '/services/data/v58.0/sobjects/';
  /** API response */
  apiResponse: any = null;
  /** Loading state for API call */
  isLoading = false;
  /** Input validation error message */
  inputError: string | null = null;
  /** Target origin for API calls */
  targetOrigin: string | null = null;

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
      const targetOrigin = this.envelope.client.targetOrigin.replace('my.salesforce.com', 'lightning.force.com');
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

    this.isLoading = true;
    this.apiResponse = null;

    try {
      const url = `${this.targetOrigin}${this.apiEndpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.envelope.client.oauthToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      this.apiResponse = {
        status: response.status,
        statusText: response.statusText,
        data: data
      };
    } catch (error) {
      this.apiResponse = {
        error: error,
        message: 'Failed to make API call'
      };
    } finally {
      this.isLoading = false;
    }
  }
}