import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthenticatedGuard} from './guards/authenticated.guard';
import { NoAuthenticatedGuard } from './guards/no-authenticated.guard';
import { GithubEmailComponent } from './pages/oauth/github-email/github-email.component';
import { MicrosoftSuccessComponent } from './pages/oauth/microsoft-success/microsoft-success.component';
import { GithubSuccessComponent } from './pages/oauth/github-success/github-success.component';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component'


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    RouterModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    GithubEmailComponent,
    MicrosoftSuccessComponent,
    GithubSuccessComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthenticatedGuard,
    NoAuthenticatedGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
