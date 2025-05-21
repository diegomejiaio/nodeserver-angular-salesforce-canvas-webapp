import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  styleUrls: ['./app.component.scss'],
  template: `
  @if (envelope) {
<div>
      <h1>Salesforce Canvas Integration - Angular App</h1>
      <ul>
        <li>User ID: {{ envelope.context.user.userId }}</li>
        <li>User Name: {{ envelope.context.user.userName }}</li>
        <li>User Email: {{ envelope.context.user.email }}</li>
        <li>User Profile: {{ envelope.context.user.fullName }}</li>
        <li>User Profile ID: {{ envelope.context.user.profileId }}</li>
        <li>User Org ID: {{ envelope.context.organization.organizationId }}</li>
        <li>User Org Name: {{ envelope.context.organization.name }}</li>
        <!-- Display full context for debugging purposes -->
        <li>Debug - Full Context: {{ envelope | json }}</li>
      </ul>
    </div>


  }
  @if (!envelope) {
    <div *ngIf="!envelope">
      <h2>No Salesforce Canvas data found</h2>
      <p>Please ensure this application is loaded within Salesforce Canvas.</p>
    </div>
  }
  `
})
export class AppComponent implements OnInit {
  /** Holds the Salesforce Canvas context data */
  envelope: any = null;

  ngOnInit() {
    // Check for globally injected Salesforce Canvas data
    if ((window as any).salesforceEnvelope) {
      this.envelope = (window as any).salesforceEnvelope;
    } else {
      alert('Testing data loaded');
      this.envelope = { "algorithm": "HMACSHA256", "issuedAt": -246115464, "userId": "005gL000002iC2jQAE", "client": { "refreshToken": null, "instanceId": "_:pep_web_app_2:j_id0:j_id1:canvasapp", "targetOrigin": "https://orgfarm-1ee7d40ed5-dev-ed.develop.my.salesforce.com", "instanceUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.my.salesforce.com", "oauthToken": "00DgL000003KIqH!AQEAQELdg05Xj5XGpK092GSPZR5gjtFSYpbhJ945elrjkFNRUG4kMrOVFlJ1rn0pxISGXRRIR0V_kPd2yNP63N9V4PfQsXAB" }, "context": { "user": { "userId": "005gL000002iC2jQAE", "userName": "diegomej704@agentforce.com", "firstName": "Diego", "lastName": "Mejia", "email": "diegomej@microsoft.com", "fullName": "Diego Mejia", "locale": "es_PE", "language": "en_US", "timeZone": "America/Lima", "profileId": "00egL000001efNI", "roleId": null, "userType": "STANDARD", "currencyISOCode": "USD", "profilePhotoUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.file.force.com/profilephoto/005/F", "profileThumbnailUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.file.force.com/profilephoto/005/T", "siteUrl": null, "siteUrlPrefix": null, "networkId": null, "accessibilityModeEnabled": false, "isDefaultNetwork": true }, "links": { "loginUrl": "https://orgfarm-1ee7d40ed5-dev-ed.develop.my.salesforce.com", "enterpriseUrl": "/services/Soap/c/63.0/00DgL000003KIqH", "metadataUrl": "/services/Soap/m/63.0/00DgL000003KIqH", "partnerUrl": "/services/Soap/u/63.0/00DgL000003KIqH", "restUrl": "/services/data/v63.0/", "sobjectUrl": "/services/data/v63.0/sobjects/", "searchUrl": "/services/data/v63.0/search/", "queryUrl": "/services/data/v63.0/query/", "recentItemsUrl": "/services/data/v63.0/recent/", "chatterFeedsUrl": "/services/data/v31.0/chatter/feeds", "chatterGroupsUrl": "/services/data/v63.0/chatter/groups", "chatterUsersUrl": "/services/data/v63.0/chatter/users", "chatterFeedItemsUrl": "/services/data/v31.0/chatter/feed-items", "userUrl": "/005gL000002iC2jQAE" }, "application": { "name": "pep_web_app_2", "canvasUrl": "https://sfcanvaswebapp002.azurewebsites.net", "applicationId": "06PgL0000004hCr", "version": "1.0", "authType": "SIGNED_REQUEST", "referenceId": "09HgL0000004D3V", "options": [], "samlInitiationMethod": "None", "namespace": "", "isInstalledPersonalApp": false, "developerName": "pep_web_app_2" }, "organization": { "organizationId": "00DgL000003KIqHUAW", "name": "Microsoft", "multicurrencyEnabled": false, "namespacePrefix": null, "currencyIsoCode": "USD" }, "environment": { "referer": null, "locationUrl": "https://orgfarm-1ee7d40ed5-dev-ed--c.develop.vf.force.com/apex/pep_web_app_2?sfdc.tabName=01rgL000004prBI&vfRetURLInSFX=%2Fhome%2Fhome.jsp&ltn_app_id=06mgL000001zOUvQAM&nonce=781140246aa70d20f7445a028ada117961d58edd350d758c5aa59e09f0c7b1a5&sfdcIFrameOrigin=https%3A%2F%2Forgfarm-1ee7d40ed5-dev-ed.develop.lightning.force.com&tour=&isdtp=p1&sfdcIFrameHost=web&clc=0", "displayLocation": "Visualforce", "sublocation": null, "uiTheme": "Theme3", "dimensions": { "width": "100%", "height": "1000px", "maxWidth": "1000px", "maxHeight": "2000px", "clientWidth": "1239px", "clientHeight": "30px" }, "parameters": {}, "record": {}, "version": { "season": "SPRING", "api": "63.0" } } } }
    }
  }
}