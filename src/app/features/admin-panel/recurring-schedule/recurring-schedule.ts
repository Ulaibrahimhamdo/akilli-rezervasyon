import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../core/firebase.config';
import { RecurringBlocks as RecurringBlocksService } from '../../../core/services/recurring-blocks';
import { Resources as ResourcesService } from '../../../core/services/resources';
import { RecurringBlock } from '../../../models/recurring-block.model';
import { Resource } from '../../../models/resource.model';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppSelect } from '../../../shared/components/app-select/app-select';
import { AppInput } from '../../../shared/components/app-input/app-input';
import { AppButton } from '../../../shared/components/app-button/app-button';

interface Period {
  id: string;
  label: string;
  order: number;
}

const GUN_ADLARI = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

/**
 * @description Ders Programi sayfasi.
 * (yeni blok ekle formu + mevcut bloklar listesi). Kullanicinin girdigi
 * baslangic/bitis saati, o araliga tam sigan periyotlara eslenerek
 * periodIds'e cevrilir.
 */
@Component({
  selector: 'app-recurring-schedule',
  imports: [FormsModule, AppCard, AppSelect, AppInput, AppButton],
  templateUrl: './recurring-schedule.html',
  styleUrl: './recurring-schedule.scss',
})
export class RecurringSchedule implements OnInit {
  private recurringBlocksService = inject(RecurringBlocksService);
  private resourcesService = inject(ResourcesService);

  resources = signal<Resource[]>([]);
  periods = signal<Period[]>([]);
  blocksForResource = signal<RecurringBlock[]>([]);

  resourceOptions = signal<{ label: string; value: string }[]>([]);
  dayOptions = GUN_ADLARI.map((gun, index) => ({ label: gun, value: index.toString() }));

  selectedResourceId = '';
  selectedDay = '';
  startTime = '';
  endTime = '';
  etiket = '';
  errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    const [resources, periodsSnapshot] = await Promise.all([
      this.resourcesService.getAllResources(),
      getDocs(collection(db, 'periods')), /**Periyotlar için ayrı bir servis yazmadım, direkt component içinde Firestore'a sordum */
    ]);

    this.resources.set(resources);
    this.resourceOptions.set(resources.map((r) => ({ label: r.ad, value: r.id })));

    const periods = periodsSnapshot.docs
      .map((d) => ({ ...(d.data() as { label: string; order: number }), id: d.id }))
      .sort((a, b) => a.order - b.order);
    this.periods.set(periods);
  }

  async onResourceChange(resourceId: string): Promise<void> {
    this.selectedResourceId = resourceId;
    const blocks = await this.recurringBlocksService.getBlocksForResource(resourceId);
    this.blocksForResource.set(blocks);
  }

  async addBlock(): Promise<void> {
    this.errorMessage.set('');

    if (!this.selectedResourceId || !this.selectedDay || !this.startTime || !this.endTime || !this.etiket.trim()) {
      this.errorMessage.set('Tüm alanları doldurun.');
      return;
    }

    const matchingPeriods = this.periods().filter((p) => {
      const [pStart, pEnd] = p.label.split('-').map((s) => s.trim());
      return pStart >= this.startTime && pEnd <= this.endTime;
    });

    if (matchingPeriods.length === 0) {
      this.errorMessage.set('Seçilen saat aralığına uyan bir periyot bulunamadı.');
      return;
    }

    const newPeriodIds = new Set(matchingPeriods.map((p) => p.id));
    const selectedDayNumber = Number(this.selectedDay);

    const hasConflict = this.blocksForResource().some((block) => {
      if (block.dayOfWeek !== selectedDayNumber) {
        return false;
      }
      return block.periodIds.some((id) => newPeriodIds.has(id));
    });

    if (hasConflict) {
      this.errorMessage.set('Bu kaynak, seçilen gün ve saatte zaten dolu. Farklı bir zaman seçin.');
      return;
    }

    await this.recurringBlocksService.createBlock({
      resourceId: this.selectedResourceId,
      dayOfWeek: selectedDayNumber,
      periodIds: matchingPeriods.map((p) => p.id),
      label: this.etiket,
    });

    this.etiket = '';
    this.startTime = '';
    this.endTime = '';
    await this.onResourceChange(this.selectedResourceId);
  }

  async deleteBlock(blockId: string): Promise<void> {
    await this.recurringBlocksService.deleteBlock(blockId);
    await this.onResourceChange(this.selectedResourceId);
  }

  blockDescription(block: RecurringBlock): string {
    const gun = GUN_ADLARI[block.dayOfWeek];
    const periods = block.periodIds
      .map((id) => this.periods().find((p) => p.id === id))
      .filter((p): p is Period => !!p)
      .sort((a, b) => a.order - b.order);

    if (periods.length === 0) {
      return `Her ${gun}`;
    }

    const start = periods[0].label.split('-')[0].trim();
    const end = periods[periods.length - 1].label.split('-')[1].trim();
    return `Her ${gun}, ${start}-${end}`;
  }
}