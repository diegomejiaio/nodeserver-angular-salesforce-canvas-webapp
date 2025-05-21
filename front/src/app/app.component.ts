import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  template: `
    <div NgIf="envelope">
      <h1>Canvas App - Bienvenido | Angular App</h1>
      <ul>
        <li>User ID: {{ envelope.context.user.userId }}</li>
        <li>User Name: {{ envelope.context.user.userName }}</li>
        <li>User Email: {{ envelope.context.user.email }}</li>
        <li>User Profile: {{ envelope.context.user.fullName }}</li>
        <li>User Profile ID: {{ envelope.context.user.profileId }}</li>
        <li>User Org ID: {{ envelope.context.organization.organizationId }}</li>
        <li>User Org Name: {{ envelope.context.organization.name }}</li>
        <!-- show the json -->
        <li>Envelope JSON: {{ envelope }}</li>
      </ul>
    </div>
    <div NgIf="!envelope">
      <h2>No se encontraron datos de usuario</h2>
    </div>
  `
})
export class AppComponent implements OnInit {
  envelope: any = null;

  ngOnInit() {
    // Checa si la variable global existe
    if ((window as any).salesforceEnvelope) {
      this.envelope = (window as any).salesforceEnvelope;
    }
  }
}