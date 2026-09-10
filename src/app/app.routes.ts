import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Auth
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
    { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },

    // Öğrenci / Akademisyen ortak sayfalar
    { path: 'home', loadComponent: () => import('./features/home/home').then(m => m.Home) },
    { path: 'reservation', loadComponent: () => import('./features/reservation/reservation').then(m => m.Reservation) },
    { path: 'my-requests', loadComponent: () => import('./features/my-requests/my-requests').then(m => m.MyRequests) },
    { path: 'notifications', loadComponent: () => import('./features/notifications/notifications').then(m => m.Notifications) },
    { path: 'profile', loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },

    // Yönetici Paneli
    { path: 'manager-panel', loadComponent: () => import('./features/manager-panel/manager-panel').then(m => m.ManagerPanel) },

    // Admin Paneli
    { path: 'admin-panel', loadComponent: () => import('./features/admin-panel/admin-panel').then(m => m.AdminPanel) },

    { path: '**', redirectTo: 'login' }
];
