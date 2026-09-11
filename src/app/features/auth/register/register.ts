import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { Auth } from '../../../core/services/auth';

/**
 * @description Kayit Ol sayfasi.
 * (ad soyad, e-posta, otomatik rol tespiti, sifre+tekrar, KVKK checkbox).
 */
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, AppButton, AppInput],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private authService = inject(Auth);
  private router = inject(Router);

  adSoyad = '';
  email = '';
  telefon = '';
  password = '';
  passwordConfirm = '';
  kvkkAccepted = false;

  errorMessage = signal('');
  isLoading = signal(false);

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');

    if (!this.kvkkAccepted) {
      this.errorMessage.set('Devam etmek için KVKK metnini onaylamalısınız.');
      return;
    }

    if (this.password !== this.passwordConfirm) {
      this.errorMessage.set('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (!this.email.endsWith('@bingol.edu.tr')) {
      this.errorMessage.set('Kayıt için @bingol.edu.tr uzantılı bir e-posta kullanmalısınız.');
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.register(this.email, this.password, this.adSoyad, this.telefon);
      this.router.navigate(['/home']);
    } catch {
      this.errorMessage.set('Kayıt oluşturulamadı. E-posta zaten kullanılıyor olabilir.');
    } finally {
      this.isLoading.set(false);
    }
  }
}