import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Auth (korumasız — herkes girebilir)
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
    { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },

    // Öğrenci / Akademisyen ortak sayfalar (korumalı)
    { path: 'home', canActivate: [authGuard], loadComponent: () => import('./features/home/home').then(m => m.Home) },
    { path: 'reservation', canActivate: [authGuard], loadComponent: () => import('./features/reservation/reservation').then(m => m.Reservation) },
    { path: 'my-requests', canActivate: [authGuard], loadComponent: () => import('./features/my-requests/my-requests').then(m => m.MyRequests) },
    { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./features/notifications/notifications').then(m => m.Notifications) },
    { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },

    // Yönetici Paneli (korumalı + sadece manager rolü)
    {
        path: 'manager-panel',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['manager'] },
        loadComponent: () => import('./features/manager-panel/manager-panel').then(m => m.ManagerPanel)
    },

    // Admin Paneli (korumalı + sadece admin rolü)
    {
        path: 'admin-panel',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./features/admin-panel/admin-panel').then(m => m.AdminPanel)
    },

    { path: '**', redirectTo: 'login' }
];