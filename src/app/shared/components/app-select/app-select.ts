import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * @description Ortak secim (dropdown) component'i.
 * Dumb component'tir — hicbir filtreleme/is mantigi tasimaz.
 * Hem statik (Benim sayfalarim(Seray)) hem cascading/bagimli (Ula'nin  akisi)
 * kullanimda ayni sekilde calisir; filtreleme mantigi hep kullanan sayfada yazilir.
 */
@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './app-select.html',
  styleUrl: './app-select.scss',
})
export class AppSelect {
  /** Secilebilir secenekler listesi. Kullanan sayfa hangi listeyi verirse o gosterilir. */
  @Input() options: { label: string; value: string }[] = [];

  /** Su an secili olan deger (value alaniyla eslesir). */
  @Input() value: string | null = null;

  /** Secim kutusu devre disi birakilsin mi (bir onceki adim tamamlanmadan). */
  @Input() disabled = false;

  /** Hicbir sey secilmemisken gorunen yer tutucu metin. */
  @Input() placeholder = '';

  /** Kullanici secim yapinca disariya guncel degeri bildirir. */
  @Output() valueChange = new EventEmitter<string>();

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }
}
