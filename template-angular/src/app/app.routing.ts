import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { GithubEmailComponent } from './pages/oauth/github-email/github-email.component';
import { MicrosoftSuccessComponent } from './pages/oauth/microsoft-success/microsoft-success.component';
import { GithubSuccessComponent } from './pages/oauth/github-success/github-success.component';
import { GoogleSuccessComponent } from './pages/oauth/google-success/google-success.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'auth/github/email-required',
    component: GithubEmailComponent
  },
  {
    path: 'auth/github/success',
    component: GithubSuccessComponent
  },
  {
    path: 'auth/microsoft/success',
    component: MicrosoftSuccessComponent
  },
  {
    path: 'auth/google/success',
    component: GoogleSuccessComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule)
      }
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/layouts/auth-layout/auth-layout.module').then(m => m.AuthLayoutModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [],
})
export class AppRoutingModule { }
