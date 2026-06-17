import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthenticatedGuard } from 'src/app/guards/authenticated.guard';
import { ParaderoCercanoComponent} from "src/app/pages/paradero-cercano/paradero-cercano.component";


export const AdminLayoutRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
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
  {
    path: 'rutas',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/ruta/ruta.module').then(m => m.RutaModule)
      }
    ]
  },
  {
    path: 'buses',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/bus/bus.module').then(m => m.BusModule)
      }
    ]
  },

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
  {
    path: 'conductores',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/conductores/conductores.module').then(m => m.ConductoresModule)
      }
    ]
  },
  {
    path: 'turnos',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/turnos/turnos.module').then(m => m.TurnosModule)
      }
    ]
  },
  {
    path: 'recargas',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/recarga/recarga.module').then(m => m.RecargaModule)
      }
    ]
  },
  {
    path: 'ciudadanos',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/ciudadano/ciudadano.module').then(m => m.CiudadanoModule)
      }
    ]
  },

  // ── Programación de Rutas ──
  {
    path: 'programaciones-ruta',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('src/app/pages/programaciones-ruta/programaciones-ruta.module')
          .then(m => m.ProgramacionesRutaModule)
      }

    ]

  },
  // ── Boletos ──
  {
    path: 'boletos',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/pages/boletos/boletos.module').then(m => m.BoletosModule),
      },
    ],
  },

  {
    path: 'historial',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/pages/historial/historial.module').then(m => m.HistorialModule),
      },
    ],
  },

  {
    path: 'reportes',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/pages/reportes/reportes.module')
            .then(m => m.ReportesModule)
      }
    ]
  },

  {
    path: 'gps',
    loadChildren: () =>
      import('src/app/pages/gps/gps.module').then(m => m.GpsModule)
  },

  {
    path: 'incidentes',
    loadChildren: () =>
      import('src/app/pages/incidentes/incidentes.module').then(m => m.IncidentesModule)
  },
  {
    path: 'grupos',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/pages/grupos/grupos.module').then(m => m.GruposModule)
      }
    ]
  },


  {
    path: 'monitoreo',
    loadChildren: () =>
      import('src/app/pages/monitoreo/monitoreo.module').then(m => m.MonitoreoModule)
  },

  {
    path: 'dashboard-buses',
    loadChildren: () => import('src/app/pages/dashboard-buses/dashboard-buses.module').then(m => m.DashboardBusesModule)
  },

  {
    path: 'mensajes',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/pages/mensajes/mensajes.module').then(m => m.MensajesModule)
      }
    ]
  },
{
    path: 'citas',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/pages/citas/citas.module').then(m => m.CitasModule)
      }
    ]
  },
{
    path: 'pqrs',
    canActivate: [AuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/pages/pqrs/pqrs.module').then(m => m.PQRSModule)
      }
    ]
  },

];
