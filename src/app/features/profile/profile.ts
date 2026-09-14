import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../core/firebase.config';
import { Auth } from '../../core/services/auth';
import { User } from '../../models/user.model';
import { AppButton } from '../../shared/components/app-button/app-button';
import { AppInput } from '../../shared/components/app-input/app-input';
import { AppCard } from '../../shared/components/app-card/app-card';
import { AppAvatar } from '../../shared/components/app-avatar/app-avatar';

type PasswordModalState = 'closed' | 'empty' | 'error' | 'success';

/**
 * @description Profil ve Ayarlar sayfasi.
 * (kimlik basligi, Kisisel Bilgiler, Sifre, Cikis Yap). Sifre Degistirme Modali
 * 3 durum destekler: Bos, Hata, Basarili.
 */
@Component({
  selector: 'app-profile',
  imports: [FormsModule, AppButton, AppInput, AppCard, AppAvatar],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  saveMessage = signal('');

  adSoyad = '';
  telefon = '';

  passwordModalState = signal<PasswordModalState>('closed');
  newPassword = '';
  newPasswordConfirm = '';
  passwordErrorMessage = signal('');

  private currentUid = '';

  ngOnInit(): void {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }
      this.currentUid = user.uid;
      const profile = await this.authService.getUserProfile(user.uid);
      this.currentUser.set(profile);
      if (profile) {
        this.adSoyad = profile.adSoyad;
        this.telefon = profile.telefon;
      }
      this.isLoading.set(false);
    });
  }

  async saveProfile(): Promise<void> {
    this.isSaving.set(true);
    this.saveMessage.set('');

    try {
      await this.authService.updateUserProfile(this.currentUid, {
        adSoyad: this.adSoyad,
        telefon: this.telefon,
      });
      this.saveMessage.set('Bilgileriniz kaydedildi.');
    } catch {
      this.saveMessage.set('Bir hata oluştu, tekrar deneyin.');
    } finally {
      this.isSaving.set(false);
    }
  }

  openPasswordModal(): void {
    this.newPassword = '';
    this.newPasswordConfirm = '';
    this.passwordErrorMessage.set('');
    this.passwordModalState.set('empty');
  }

  closePasswordModal(): void {
    this.passwordModalState.set('closed');
  }

  async submitPasswordChange(): Promise<void> {
    if (this.newPassword.length < 6) {
      this.passwordErrorMessage.set('Şifre en az 6 karakter olmalıdır.');
      this.passwordModalState.set('error');
      return;
    }

    if (this.newPassword !== this.newPasswordConfirm) {
      this.passwordErrorMessage.set('Şifreler birbiriyle eşleşmiyor.');
      this.passwordModalState.set('error');
      return;
    }

    try {
      await this.authService.changePassword(this.newPassword);
      this.passwordModalState.set('success');
    } catch {
      this.passwordErrorMessage.set('Şifre değiştirilemedi. Lütfen tekrar giriş yapıp deneyin.');
      this.passwordModalState.set('error');
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
