import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Resource } from '../../../models/resource.model';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppButton } from '../../../shared/components/app-button/app-button';

/**
 * @description Kaynagi Sil Modali. (basit onay modali).
 * Dumb component'tir.
 */
@Component({
  selector: 'app-delete-resource-modal',
  imports: [AppCard, AppButton],
  templateUrl: './delete-resource-modal.html',
  styleUrl: './delete-resource-modal.scss',
})
export class DeleteResourceModal {
  @Input() resource: Resource | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}