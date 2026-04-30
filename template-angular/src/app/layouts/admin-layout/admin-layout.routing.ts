import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthenticatedGuard } from 'src/app/guards/authenticated.guard';
import {ParaderoCercanoComponent} from "src/app/pages/paradero-cercano/paradero-cercano.component";


export const AdminLayoutRoutes: Routes = [
    {
      path: 'dashboard',
      component: DashboardComponent,
      canActivate: [AuthenticatedGuard]
    },
    {
      path: 'user-profile',
      component: UserProfileComponent,
      canActivate: [AuthenticatedGuard]
    },
    {
      path: 'tables',
      component: TablesComponent,
      canActivate: [AuthenticatedGuard]
    },
    {
      path: 'users',
      canActivate: [AuthenticatedGuard],
      children: [
        {
          path: '',
          loadChildren: () => import('src/app/pages/user/users.module').then(m => m.UsersModule)
        }
      ]
    },
    {
      path: 'roles',
      canActivate: [AuthenticatedGuard],
      children: [
        {
          path: '',
          loadChildren: () => import('src/app/pages/role/role.module').then(m => m.RolesModule)
        }
      ]
    },
    {
      path: 'user-role',
      canActivate: [AuthenticatedGuard],
      children: [
        {
          path: '',
          loadChildren: () => import('src/app/pages/userRole/usersRoles.module').then(m => m.UsersRolesModule)
        }
      ]
    },
    {
        path: 'profiles',
        canActivate: [AuthenticatedGuard],
        children: [
          {
            path: '',
            loadChildren: () => import('src/app/pages/profile/profile.module').then(m => m.ProfilesModule)
          }
        ]
      },
    {
            path: 'sessions',
            //canActivate: [AuthenticatedGuard],
            children: [
              {
                path: '',
                loadChildren: () => import('src/app/pages/session/session.module').then(m => m.SessionsModule)
              }
            ]
          },
        {
                path: 'permissions',
                canActivate: [AuthenticatedGuard],
                children: [
                  {
                    path: '',
                    loadChildren: () => import('src/app/pages/permissions/permissions.module').then(m => m.PermissionsModule)
                  }
                ]
              },
// admin-layout.routing.ts

// ── Paradero cercano (mapa GPS) ──
  {
    path: 'paraderos/cercanos',
    component: ParaderoCercanoComponent,
    canActivate: [AuthenticatedGuard]
  },

// ── Gestión CRUD ──
  {
    path: 'paraderos',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('../../pages/paradero/paradero.module')
          .then(m => m.ParaderoModule)
      }
    ]
  },
];
