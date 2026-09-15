import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../core/firebase.config';
import { Auth } from '../../core/services/auth';
import { Notifications as NotificationsService } from '../../core/services/notifications';
import { Bookings } from '../../core/services/bookings';
import { SystemSettings as SystemSettingsService } from '../../core/services/system-settings';
import { User } from '../../models/user.model';
import { AppAvatar } from '../../shared/components/app-avatar/app-avatar';
import { LockModal, UrgentBookingInfo } from './lock-modal/lock-modal';
import { RejectModal } from './reject-modal/reject-modal';
import { ResourceStatus } from './resource-status/resource-status';
import { RequestManagement } from './request-management/request-management';

/**
 * @description Yonetici Paneli ana kabugu.
 * (avatar+isim+rol, 4 menu ogesi, bildirim sayaci). Sayfa acildiginda,
 * baslangicina managerResponseHours'tan az kalmis bekleyen talepleri kontrol edip
 * varsa Kilit Modali'ni gosterir.
 */
@Component({
  selector: 'app-manager-panel',
  imports: [RouterLink, AppAvatar, LockModal, RejectModal, ResourceStatus, RequestManagement],
  templateUrl: './manager-panel.html',
  styleUrl: './manager-panel.scss',
})
export class ManagerPanel implements OnInit {
  private authService = inject(Auth);
  private notificationsService = inject(NotificationsService);
  private bookingsService = inject(Bookings);
  private systemSettingsService = inject(SystemSettingsService);

  currentUser = signal<User | null>(null);
  unreadCount = signal(0);
  activeSection = signal<'requests' | 'resources'>('requests');

  urgentBookings = signal<UrgentBookingInfo[]>([]);
  urgentIndex = signal(0);

  rejectingUrgentBookingId = signal<string | null>(null);
  urgentRejectError = signal('');

  get currentUrgentBooking(): UrgentBookingInfo | null {
    return this.urgentBookings()[this.urgentIndex()] ?? null;
  }

  ngOnInit(): void {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }
      const profile = await this.authService.getUserProfile(user.uid);
      this.currentUser.set(profile);

      const count = await this.notificationsService.getUnreadCount(user.uid);
      this.unreadCount.set(count);

      await this.loadUrgentBookings();
    });
  }

  private async loadUrgentBookings(): Promise<void> {
    const settings = await this.systemSettingsService.getSettings();
    const urgent = await this.bookingsService.getUrgentPendingBookings(settings.managerResponseHours);
    this.urgentBookings.set(urgent);
    this.urgentIndex.set(0);
  }

  async handleUrgentApprove(bookingId: string): Promise<void> {
    await this.bookingsService.approveBooking(bookingId);
    this.advanceUrgentQueue();
  }

  openUrgentReject(bookingId: string): void {
    this.rejectingUrgentBookingId.set(bookingId);
    this.urgentRejectError.set('');
  }

  async handleUrgentRejectConfirm(reason: string): Promise<void> {
    const bookingId = this.rejectingUrgentBookingId();
    const urgentInfo = this.urgentBookings().find((u) => u.booking.id === bookingId);
    if (!urgentInfo) {
      return;
    }

    try {
      await this.bookingsService.rejectBooking(bookingId!, reason, urgentInfo.booking.userId);
      this.rejectingUrgentBookingId.set(null);
      this.advanceUrgentQueue();
    } catch {
      this.urgentRejectError.set('Reddetme işlemi başarısız oldu, tekrar deneyin.');
    }
  }

  private advanceUrgentQueue(): void {
    const remaining = this.urgentBookings().filter(
      (u) => u.booking.id !== this.currentUrgentBooking?.booking.id
    );
    this.urgentBookings.set(remaining);
    this.urgentIndex.set(0);
  }

  setSection(section: 'requests' | 'resources'): void {
    this.activeSection.set(section);
  }
}