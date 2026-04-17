import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'stats',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'types',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/types/types.component').then(m => m.TypesComponent)
  },
  {
    path: 'add-session',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/add-session/add-session.component').then(m => m.AddSessionComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
