import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { Auth } from '../../../core/services/auth';

/**
 * @description Giris sayfasi.
 * (e-posta/sifre, domain kisitli not, "Sifremi unuttum" linki).
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, AppButton, AppInput],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = signal('');
  isLoading = signal(false);

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch {
      this.errorMessage.set('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
    } finally {
      this.isLoading.set(false);
    }
  }
}