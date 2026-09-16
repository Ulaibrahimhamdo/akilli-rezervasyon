import { Injectable } from '@angular/core';
import { collection, getDocs, query, where, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Resource } from '../../models/resource.model';

export interface ResourceStatusInfo {
  resource: Resource;
  statusColor: 'red' | 'green' | 'yellow';
  statusText: string;
  nextInfoText: string;
}

export const BINALAR = [
  'Diş Hekimliği Fakültesi',
  'Fen Edebiyat Fakültesi',
  'Fizik Tedavi ve Rehabilitasyon Fakültesi',
  'İktisadi ve İdari Bilimler Fakültesi',
  'İlahiyat Fakültesi',
  'Mühendislik ve Mimarlık Fakültesi',
  'Sağlık Bilimleri Fakültesi',
  'Spor Bilimleri Fakültesi',
  'Veteriner Fakültesi',
  'Ziraat Fakültesi',
];

export const KATEGORILER = [
  'Laboratuvar',
  'Konferans Salonu',
  'Çalışma Alanı',
  'Derslik',
  'Toplantı Odası',
];

/**
 * @description Kaynak (Resource) servisi. Bolum kaynaklarinin "su an" durumunu
 * (bos/dolu/ders programi) hesaplamanin yani sira, Admin Paneli icin
 * kaynak listeleme, ekleme, guncelleme ve silme islemlerini icerir.
 */
@Injectable({
  providedIn: 'root',
})
export class Resources {
  async getAllResources(): Promise<Resource[]> {
    const snapshot = await getDocs(collection(db, 'resources'));
    return snapshot.docs.map((d) => ({ ...(d.data() as Resource), id: d.id }));
  }

  async createResource(data: Omit<Resource, 'id'>): Promise<void> {
    await addDoc(collection(db, 'resources'), data);
  }

  async updateResource(id: string, data: Omit<Resource, 'id'>): Promise<void> {
    await updateDoc(doc(db, 'resources', id), data);
  }

  async deleteResource(id: string): Promise<void> {
    await deleteDoc(doc(db, 'resources', id));
  }

  async getResourceStatuses(): Promise<ResourceStatusInfo[]> {
    const today = new Date();
    const todayDateStr = this.formatDate(today);
    const todayDayOfWeek = this.getDayOfWeekIndex(today);

    const [resourcesSnapshot, periodsSnapshot, bookingsSnapshot, blocksSnapshot] = await Promise.all([
      getDocs(collection(db, 'resources')),
      getDocs(collection(db, 'periods')),
      getDocs(query(collection(db, 'bookings'), where('date', '==', todayDateStr), where('status', '==', 'approved'))),
      getDocs(collection(db, 'recurringBlocks')),
    ]);

    const resources = resourcesSnapshot.docs.map((d) => ({ ...(d.data() as Resource), id: d.id }));

    const periodsById = new Map(
      periodsSnapshot.docs.map((d) => [d.id, d.data() as { label: string; order: number }])
    );

    const todaysBookings = bookingsSnapshot.docs.map((d) => d.data() as {
      resourceId: string;
      periodIds: string[];
    });

    const todaysBlocks = blocksSnapshot.docs
      .map((d) => d.data() as { resourceId: string; dayOfWeek: number; periodIds: string[]; label: string })
      .filter((b) => b.dayOfWeek === todayDayOfWeek);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return resources.map((resource) => {
      const booking = todaysBookings.find((b) => b.resourceId === resource.id);
      const block = todaysBlocks.find((b) => b.resourceId === resource.id);

      const activePeriodIds = booking?.periodIds ?? block?.periodIds ?? null;

      if (activePeriodIds) {
        const periods = activePeriodIds
          .map((id) => periodsById.get(id))
          .filter((p): p is { label: string; order: number } => !!p)
          .sort((a, b) => a.order - b.order);

        const isOngoing = periods.some((p) => this.isPeriodOngoing(p.label, currentMinutes));

        if (isOngoing) {
          const lastPeriod = periods[periods.length - 1];
          const endTime = lastPeriod.label.split('-')[1]?.trim() ?? '';

          if (booking) {
            return {
              resource,
              statusColor: 'red' as const,
              statusText: `Şu an dolu — ${endTime}'e kadar`,
              nextInfoText: `Sonraki boş: ${endTime}`,
            };
          }
          return {
            resource,
            statusColor: 'yellow' as const,
            statusText: `Ders programı — ${endTime}'e kadar`,
            nextInfoText: `Sonraki boş: ${endTime}`,
          };
        }
      }

      return {
        resource,
        statusColor: 'green' as const,
        statusText: 'Şu an boş',
        nextInfoText: 'Bütün gün boş',
      };
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDayOfWeekIndex(date: Date): number {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  private isPeriodOngoing(label: string, currentMinutes: number): boolean {
    const [startStr, endStr] = label.split('-').map((s) => s.trim());
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}