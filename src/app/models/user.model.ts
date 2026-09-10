export type UserRole = 'student' | 'academic' | 'manager' | 'admin';

export interface User {
    uid: string;
    adSoyad: string;
    email: string;
    telefon: string;
    role: UserRole;
    department?: string;
}