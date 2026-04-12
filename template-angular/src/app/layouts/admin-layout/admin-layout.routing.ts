import { Routes } from '@angular/router';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';


export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'tables',         component: TablesComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    {
      path: 'users',
      //canActivate: [AuthenticatedGuard],
      children: [
        {
          path: '',
          loadChildren: () => import('src/app/pages/user/users.module').then(m => m.UsersModule)
        }
      ]
    },
    {
      path: 'roles',
      //canActivate: [AuthenticatedGuard],
      children: [
        {
          path: '',
          loadChildren: () => import('src/app/pages/role/role.module').then(m => m.RolesModule)
        }
      ]
    },
    {
      path: 'user-role',
      //canActivate: [AuthenticatedGuard],
      children: [
        {
          path: '',
          loadChildren: () => import('src/app/pages/userRole/usersRoles.module').then(m => m.UsersRolesModule)
        }
      ]
    },
    {
        path: 'profiles',
        //canActivate: [AuthenticatedGuard],
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

];
