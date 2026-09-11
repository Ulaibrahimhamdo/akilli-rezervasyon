import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * @description Ortak metin girisi component'i.
 * Dumb component'tir — hicbir dogrulama/is mantigi tasimaz, sadece Input/Output ile yonetilir.
 */
@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './app-input.html',
  styleUrl: './app-input.scss',
})
export class AppInput {
  /** Inputun mevcut degeri. Kullanan sayfa disaridan kontrol eder. */
  @Input() value = '';

  /** Input bos oldugunda gorunen yer tutucu metin. */
  @Input() placeholder = '';

  /** HTML input tipi (text, email, password vb.). */
  @Input() type: 'text' | 'email' | 'password' | 'tel' = 'text';

  /** Input devre disi birakilsin mi. */
  @Input() disabled = false;

  /** Kullanici yazi yazdikca disariya guncel degeri bildirir. */
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
