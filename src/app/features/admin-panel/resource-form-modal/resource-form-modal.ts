import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BINALAR, KATEGORILER } from '../../../core/services/resources';
import { Resource } from '../../../models/resource.model';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { AppSelect } from '../../../shared/components/app-select/app-select';
import { AppButton } from '../../../shared/components/app-button/app-button';

/**
 * @description Kaynak Formu modali. Hem "Yeni kaynak ekle"
 * hem "Kaynagi duzenle" icin ayni component kullanilir (mode Input'una gore).
 * Dumb component'tir — Firestore'a dokunmaz, veriyi disariya bildirir.
 */
@Component({
  selector: 'app-resource-form-modal',
  imports: [FormsModule, AppCard, AppInput, AppSelect, AppButton],
  templateUrl: './resource-form-modal.html',
  styleUrl: './resource-form-modal.scss',
})
export class ResourceFormModal implements OnChanges {
  @Input() open = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() editingResource: Resource | null = null;

  @Output() save = new EventEmitter<Omit<Resource, 'id'>>();
  @Output() cancel = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<void>();

  ad = '';
  kapasite: number | null = null;
  bina = '';
  kategori = '';

  buildingOptions = BINALAR.map((b) => ({ label: b, value: b }));
  categoryOptions = KATEGORILER.map((k) => ({ label: k, value: k }));

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.editingResource) {
      this.ad = this.editingResource.ad;
      this.kapasite = this.editingResource.kapasite;
      this.bina = this.editingResource.bina;
      this.kategori = this.editingResource.kategori;
    } else if (this.mode === 'add') {
      this.ad = '';
      this.kapasite = null;
      this.bina = '';
      this.kategori = '';
    }
  }

  onSave(): void {
    if (!this.ad.trim() || !this.kapasite || !this.bina || !this.kategori) {
      return;
    }

    this.save.emit({
      ad: this.ad,
      kapasite: this.kapasite,
      bina: this.bina,
      kategori: this.kategori,
      durum: 'active',
    });
  }
}