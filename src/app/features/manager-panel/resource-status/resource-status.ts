import { Component, inject, signal, OnInit } from '@angular/core';
import { Resources, ResourceStatusInfo } from '../../../core/services/resources';
import { AppCard } from '../../../shared/components/app-card/app-card';

/**
 * @description Bolum Kaynaklari Durumu sayfasi.
 * (renk kodlu kaynak satirlari — kirmizi: dolu, sari: ders programi, yesil: bos).
 */
@Component({
  selector: 'app-resource-status',
  imports: [AppCard],
  templateUrl: './resource-status.html',
  styleUrl: './resource-status.scss',
})
export class ResourceStatus implements OnInit {
  private resourcesService = inject(Resources);

  statuses = signal<ResourceStatusInfo[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadStatuses();
  }

  async loadStatuses(): Promise<void> {
    this.isLoading.set(true);
    const statuses = await this.resourcesService.getResourceStatuses();
    this.statuses.set(statuses);
    this.isLoading.set(false);
  }
}