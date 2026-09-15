import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { AppButton } from '../../../shared/components/app-button/app-button';

/**
 * @description Reddet Modali.(zorunlu gerekce alani).
 * Presentational (dumb) component'tir — Firestore'a hicbir sekilde dokunmaz,
 * sadece gerekceyi toplar ve disariya bildirir; asil reddetme islemini
 * kullanan sayfa (request-management) yapar.
 */
@Component({
  selector: 'app-reject-modal',
  imports: [FormsModule, AppCard, AppInput, AppButton],
  templateUrl: './reject-modal.html',
  styleUrl: './reject-modal.scss',
})
export class RejectModal {
  /** Modal acik mi kapali mi. */
  @Input() open = false;

  /** Disaridan gelen hata mesaji (orn. Firestore islemi basarisiz olursa). */
  @Input() errorMessage = '';

  /** Kullanici "Reddi Onayla" dedi ve gerekce dolu; gerekce metnini disariya iletir. */
  @Output() confirmReject = new EventEmitter<string>();

  /** Kullanici "Vazgeç" dedi ya da modali kapatti. */
  @Output() cancel = new EventEmitter<void>();

  reason = '';
  private localErrorMessage = '';

  get displayError(): string {
    return this.localErrorMessage || this.errorMessage;
  }

  onConfirm(): void {
    if (!this.reason.trim()) {
      this.localErrorMessage = 'Gerekçe alanı zorunludur.';
      return;
    }
    this.localErrorMessage = '';
    this.confirmReject.emit(this.reason);
  }

  onCancel(): void {
    this.reason = '';
    this.localErrorMessage = '';
    this.cancel.emit();
  }
}
