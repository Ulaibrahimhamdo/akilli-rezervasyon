import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SystemSettings as SystemSettingsService } from '../../../core/services/system-settings';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppButton } from '../../../shared/components/app-button/app-button';

/**
 * @description Sistem Ayarlari sayfasi. Belge Bolum 8'deki tanima uyar
 * (3 parametre karti + Kaydet). Degerler SystemSettingsService uzerinden
 * Firestore'dan okunur ve yazilir, hard-coded degildir.
 */
@Component({
  selector: 'app-system-settings',
  imports: [FormsModule, AppCard, AppButton],
  templateUrl: './system-settings.html',
  styleUrl: './system-settings.scss',
})
export class SystemSettings implements OnInit {
  private systemSettingsService = inject(SystemSettingsService);

  isLoading = signal(true);
  isSaving = signal(false);
  saveMessage = signal('');

  monthlyLimit: number | null = null;
  managerResponseHours: number | null = null;
  cancelDeadlineHours: number | null = null;

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    const settings = await this.systemSettingsService.getSettings();
    this.monthlyLimit = settings.monthlyLimit;
    this.managerResponseHours = settings.managerResponseHours;
    this.cancelDeadlineHours = settings.cancelDeadlineHours;
    this.isLoading.set(false);
  }

  async save(): Promise<void> {
    if (!this.monthlyLimit || !this.managerResponseHours || !this.cancelDeadlineHours) {
      this.saveMessage.set('Tüm alanlar doldurulmalıdır.');
      return;
    }

    this.isSaving.set(true);
    this.saveMessage.set('');

    try {
      await this.systemSettingsService.updateSettings({
        monthlyLimit: this.monthlyLimit,
        managerResponseHours: this.managerResponseHours,
        cancelDeadlineHours: this.cancelDeadlineHours,
      });
      this.saveMessage.set('Ayarlar kaydedildi.');
    } catch {
      this.saveMessage.set('Bir hata oluştu, tekrar deneyin.');
    } finally {
      this.isSaving.set(false);
    }
  }
}