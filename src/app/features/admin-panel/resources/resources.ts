import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Resources as ResourcesService, BINALAR } from '../../../core/services/resources';
import { Resource } from '../../../models/resource.model';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { AppSelect } from '../../../shared/components/app-select/app-select';
import { ResourceFormModal } from '../resource-form-modal/resource-form-modal';
import { DeleteResourceModal } from '../delete-resource-modal/delete-resource-modal';

/**
 * @description Kaynaklar sayfasi.
 * (liste + arama/filtre, Duzenle/Sil, Yeni Kaynak butonu).
 */
@Component({
  selector: 'app-resources',
  imports: [FormsModule, AppButton, AppInput, AppSelect, ResourceFormModal, DeleteResourceModal],
  templateUrl: './resources.html',
  styleUrl: './resources.scss',
})
export class Resources implements OnInit {
  private resourcesService = inject(ResourcesService);

  allResources = signal<Resource[]>([]);
  isLoading = signal(true);

  searchText = '';
  selectedBuilding = '';

  buildingOptions = [
    { label: 'Tüm binalar', value: '' },
    ...BINALAR.map((b) => ({ label: b, value: b })),
  ];

  formModalOpen = signal(false);
  formModalMode = signal<'add' | 'edit'>('add');
  editingResource = signal<Resource | null>(null);

  deletingResource = signal<Resource | null>(null);

  filteredResources = computed(() => {
    return this.allResources().filter((r) => {
      const matchesSearch = r.ad.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesBuilding = !this.selectedBuilding || r.bina === this.selectedBuilding;
      return matchesSearch && matchesBuilding;
    });
  });

  ngOnInit(): void {
    this.loadResources();
  }

  async loadResources(): Promise<void> {
    this.isLoading.set(true);
    const resources = await this.resourcesService.getAllResources();
    this.allResources.set(resources);
    this.isLoading.set(false);
  }

  onSearchChange(value: string): void {
    this.searchText = value;
  }

  onBuildingChange(value: string): void {
    this.selectedBuilding = value;
  }

  openAddModal(): void {
    this.formModalMode.set('add');
    this.editingResource.set(null);
    this.formModalOpen.set(true);
  }

  openEditModal(resource: Resource): void {
    this.formModalMode.set('edit');
    this.editingResource.set(resource);
    this.formModalOpen.set(true);
  }

  closeFormModal(): void {
    this.formModalOpen.set(false);
  }

  async handleFormSave(data: Omit<Resource, 'id'>): Promise<void> {
    const editing = this.editingResource();
    if (editing) {
      await this.resourcesService.updateResource(editing.id, data);
    } else {
      await this.resourcesService.createResource(data);
    }
    this.formModalOpen.set(false);
    await this.loadResources();
  }

  requestDelete(resource: Resource): void {
    this.formModalOpen.set(false);
    this.deletingResource.set(resource);
  }

  cancelDelete(): void {
    this.deletingResource.set(null);
  }

  async confirmDelete(): Promise<void> {
    const resource = this.deletingResource();
    if (!resource) {
      return;
    }
    await this.resourcesService.deleteResource(resource.id);
    this.deletingResource.set(null);
    await this.loadResources();
  }
}