import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { RoleEmploye } from './core/models/employe.model';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
      },
      {
        path: 'machines',
        loadComponent: () => import('./features/machines/machines.component').then((m) => m.MachinesComponent),
      },
      {
        path: 'articles',
        loadComponent: () => import('./features/articles/articles.component').then((m) => m.ArticlesComponent),
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/clients.component').then((m) => m.ClientsComponent),
      },
      {
        path: 'locations',
        loadComponent: () => import('./features/locations/locations.component').then((m) => m.LocationsComponent),
      },
      {
        path: 'ventes',
        loadComponent: () => import('./features/ventes/ventes.component').then((m) => m.VentesComponent),
      },
      {
        path: 'employes',
        loadComponent: () => import('./features/employes/employes.component').then((m) => m.EmployesComponent),
        canActivate: [roleGuard(RoleEmploye.ADMINISTRATEUR)],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
