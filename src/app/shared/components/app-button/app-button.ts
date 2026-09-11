import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * @description Ortak buton component'i. 4 varyant destekler: primary, secondary, danger, success.
 * Dumb component'tir — hiçbir iş mantığı taşımaz, sadece Input/Output ile dışarıdan yönetilir.
 */
@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './app-button.html',
  styleUrl: './app-button.scss',
})
export class AppButton {
  /** Butonun görsel varyantı.  */
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary';

  /** Buton devre dışı bırakılsın mı (form geçersizken). */
  @Input() disabled = false;

  /** HTML buton tipi — form içinde submit olarak kullanılacaksa 'submit' verilir. */
  @Input() type: 'button' | 'submit' = 'button';

  /** Butona tıklanınca dışarıya bildirim gönderir; asıl işlemi kullanan sayfa yapar. */
  @Output() buttonClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
}
