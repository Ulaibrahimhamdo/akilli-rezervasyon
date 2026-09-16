import { Injectable } from '@angular/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Resource } from '../../models/resource.model';

export interface CategoryUsage {
  category: string;
  percentage: number;
}

export interface DashboardStats {
  totalResources: number;
  todaysBookings: number;
  pendingRequests: number;
  categoryUsage: CategoryUsage[];
}

/**
 * @description Dashboard servisi. Admin Paneli'ndeki Sistem Dashboard sayfasi icin
 * gerekli metrikleri (toplam kaynak, bugunku rezervasyon, bekleyen talep,
 * kategoriye gore kullanim) Firestore'dan hesaplar.
 */
@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  async getStats(): Promise<DashboardStats> {
    const todayDateStr = this.formatDate(new Date());

    const [resourcesSnapshot, todaysBookingsSnapshot, pendingSnapshot] = await Promise.all([
      getDocs(collection(db, 'resources')),
      getDocs(query(collection(db, 'bookings'), where('date', '==', todayDateStr), where('status', '==', 'approved'))),
      getDocs(query(collection(db, 'bookings'), where('status', '==', 'pending'))),
    ]);

    const resources = resourcesSnapshot.docs.map((d) => d.data() as Resource);
    const todaysBookings = todaysBookingsSnapshot.docs.map((d) => d.data() as { resourceId: string });

    const usedResourceIds = new Set(todaysBookings.map((b) => b.resourceId));

    const categories = [...new Set(resources.map((r) => r.kategori))];
    const categoryUsage: CategoryUsage[] = categories.map((category) => {
      const resourcesInCategory = resourcesSnapshot.docs.filter(
        (d) => (d.data() as Resource).kategori === category
      );
      const usedInCategory = resourcesInCategory.filter((d) => usedResourceIds.has(d.id));

      const percentage = resourcesInCategory.length > 0
        ? Math.round((usedInCategory.length / resourcesInCategory.length) * 100)
        : 0;

      return { category, percentage };
    });

    return {
      totalResources: resources.length,
      todaysBookings: todaysBookings.length,
      pendingRequests: pendingSnapshot.size,
      categoryUsage: categoryUsage.sort((a, b) => b.percentage - a.percentage),
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}