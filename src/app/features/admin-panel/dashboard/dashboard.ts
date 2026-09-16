import { Component, inject, signal, OnInit } from '@angular/core';
import { Dashboard as DashboardService, DashboardStats } from '../../../core/services/dashboard';
import { AppCard } from '../../../shared/components/app-card/app-card';

/**
 * @description Sistem Dashboard sayfasi.
 * (3 metrik, kategoriye gore kullanim ilerleme cubuklari, Sistem Sagligi karti).
 */
@Component({
  selector: 'app-dashboard',
  imports: [AppCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.isLoading.set(true);
    const stats = await this.dashboardService.getStats();
    this.stats.set(stats);
    this.isLoading.set(false);
  }
}