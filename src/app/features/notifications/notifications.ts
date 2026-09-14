import { Component, inject, signal, OnInit } from '@angular/core';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../core/firebase.config';
import { Notifications as NotificationsService } from '../../core/services/notifications';
import { AppNotification, NotificationType } from '../../models/notification.model';
import { AppButton } from '../../shared/components/app-button/app-button';
import { AppBadge } from '../../shared/components/app-badge/app-badge';
import { AppCard } from '../../shared/components/app-card/app-card';

/**
 * @description Bildirimler sayfasi. Belge Bolum 8'deki tanima uyar
 * (filtre sekmeleri, tumunu okundu isaretle).
 */
@Component({
  selector: 'app-notifications',
  imports: [AppButton, AppBadge, AppCard],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  private notificationsService = inject(NotificationsService);

  allNotifications = signal<AppNotification[]>([]);
  activeFilter = signal<'all' | 'unread'>('all');
  isLoading = signal(true);
  private currentUserId = '';

  ngOnInit(): void {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }
      this.currentUserId = user.uid;
      await this.loadNotifications();
    });
  }

  async loadNotifications(): Promise<void> {
    this.isLoading.set(true);
    const notifications = await this.notificationsService.getUserNotifications(this.currentUserId);
    this.allNotifications.set(notifications);
    this.isLoading.set(false);
  }

  get filteredNotifications(): AppNotification[] {
    if (this.activeFilter() === 'unread') {
      return this.allNotifications().filter((n) => !n.read);
    }
    return this.allNotifications();
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.activeFilter.set(filter);
  }

  async markAsRead(notification: AppNotification): Promise<void> {
    if (notification.read) {
      return;
    }
    await this.notificationsService.markAsRead(notification.id);
    await this.loadNotifications();
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationsService.markAllAsRead(this.currentUserId);
    await this.loadNotifications();
  }

  badgeVariant(type: NotificationType): 'success' | 'warning' | 'danger' {
    switch (type) {
      case 'approval':
        return 'success';
      case 'rejection':
        return 'danger';
      default:
        return 'warning';
    }
  }
}