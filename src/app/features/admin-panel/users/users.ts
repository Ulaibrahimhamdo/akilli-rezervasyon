import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { User, UserRole } from '../../../models/user.model';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { AppSelect } from '../../../shared/components/app-select/app-select';
import { AppAvatar } from '../../../shared/components/app-avatar/app-avatar';

/**
 * @description Kullanicilar sayfasi.
 * (liste + arama + rol dropdown'lari). Rol degisikligi dropdown'dan
 * secilir secilmez aninda kaydedilir (MVP — Cloud Function ile
 * sikilastirma ileride konusulacak).
 */
@Component({
  selector: 'app-users',
  imports: [FormsModule, AppInput, AppSelect, AppAvatar],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private authService = inject(Auth);

  allUsers = signal<User[]>([]);
  isLoading = signal(true);
  searchText = '';

  roleOptions = [
    { label: 'Öğrenci', value: 'student' },
    { label: 'Akademisyen', value: 'academic' },
    { label: 'Yönetici', value: 'manager' },
    { label: 'Admin', value: 'admin' },
  ];

  filteredUsers = computed(() => {
    const search = this.searchText.toLowerCase();
    return this.allUsers().filter(
      (u) => u.adSoyad.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    const users = await this.authService.getAllUsers();
    this.allUsers.set(users);
    this.isLoading.set(false);
  }

  onSearchChange(value: string): void {
    this.searchText = value;
  }

  async onRoleChange(user: User, newRole: string): Promise<void> {
    await this.authService.updateUserRole(user.uid, newRole as UserRole);
    await this.loadUsers();
  }
}