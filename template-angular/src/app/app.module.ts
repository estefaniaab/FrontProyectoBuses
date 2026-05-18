import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ← ReactiveFormsModule agregado
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { NoAuthenticatedGuard } from './guards/no-authenticated.guard';
import { GithubEmailComponent } from './pages/oauth/github-email/github-email.component';
import { MicrosoftSuccessComponent } from './pages/oauth/microsoft-success/microsoft-success.component';
import { GithubSuccessComponent } from './pages/oauth/github-success/github-success.component';
import { GoogleSuccessComponent } from './pages/oauth/google-success/google-success.component';
import { RecaptchaModule, RecaptchaFormsModule, RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { environment } from '../environments/environment';
import { Verify2faComponent } from './pages/verify2fa/verify2fa.component';
import { GestionarParaderosModalComponent } from './pages/gestionar-paraderos-modal/gestionar-paraderos-modal.component';
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatCardModule} from "@angular/material/card";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatChipsModule} from "@angular/material/chips";
import {DragDropModule} from "@angular/cdk/drag-drop";
import { DashboardComponent } from './pages/reportes/dashboard/dashboard.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    RecaptchaV3Module,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatChipsModule,
    DragDropModule
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    GithubEmailComponent,
    MicrosoftSuccessComponent,
    GithubSuccessComponent,
    GoogleSuccessComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    Verify2faComponent,


  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthenticatedGuard,
    NoAuthenticatedGuard,
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptcha_site_key_v3
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
