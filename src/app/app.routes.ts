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
        loadComponent: () => import('./features/manager-panel/manager-panel').then(m => m.ManagerPanel),
        children: [
            { path: '', redirectTo: 'requests', pathMatch: 'full' },
            { path: 'requests', loadComponent: () => import('./features/manager-panel/request-management/request-management').then(m => m.RequestManagement) },
            { path: 'resources', loadComponent: () => import('./features/manager-panel/resource-status/resource-status').then(m => m.ResourceStatus) },
            { path: 'notifications', loadComponent: () => import('./features/notifications/notifications').then(m => m.Notifications) },
            { path: 'profile', loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },
        ]
    },

    // Admin Paneli (korumalı + sadece admin rolü)
    {
        path: 'admin-panel',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./features/admin-panel/admin-panel').then(m => m.AdminPanel),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./features/admin-panel/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'resources', loadComponent: () => import('./features/admin-panel/resources/resources').then(m => m.Resources) },
            { path: 'recurring-schedule', loadComponent: () => import('./features/admin-panel/recurring-schedule/recurring-schedule').then(m => m.RecurringSchedule) },
            { path: 'users', loadComponent: () => import('./features/admin-panel/users/users').then(m => m.Users) },
            { path: 'system-settings', loadComponent: () => import('./features/admin-panel/system-settings/system-settings').then(m => m.SystemSettings) },
            { path: 'notifications', loadComponent: () => import('./features/notifications/notifications').then(m => m.Notifications) },
            { path: 'profile', loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },
        ]
    },
    { path: '**', redirectTo: 'login' }
];