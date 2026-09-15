import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bookings } from '../../../core/services/bookings';
import { Booking } from '../../../models/booking.model';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { AppBadge } from '../../../shared/components/app-badge/app-badge';
import { RejectModal } from '../reject-modal/reject-modal';

/**
 * @description Talep Yonetimi sayfasi.
 * (filtreler, talep kartlari, Onayla/Reddet, sayfalama). Ilk versiyon:
 * birim filtrelemesi yok (Resource modelinde henuz department alani yok),
 * tum bekleyen talepler listelenir.
 */
@Component({
  selector: 'app-request-management',
  imports: [AppCard, AppButton, AppBadge, RejectModal],
  templateUrl: './request-management.html',
  styleUrl: './request-management.scss',
})
export class RequestManagement implements OnInit {
  private bookingsService = inject(Bookings);

  pendingBookings = signal<Booking[]>([]);
  isLoading = signal(true);

  rejectingBookingId = signal<string | null>(null);
  rejectServiceError = signal('');

  ngOnInit(): void {
    this.loadPendingBookings();
  }

  async loadPendingBookings(): Promise<void> {
    this.isLoading.set(true);
    const bookings = await this.bookingsService.getPendingBookings();
    this.pendingBookings.set(bookings);
    this.isLoading.set(false);
  }

  async approve(booking: Booking): Promise<void> {
    await this.bookingsService.approveBooking(booking.id);
    await this.loadPendingBookings();
  }

  openRejectModal(booking: Booking): void {
    this.rejectingBookingId.set(booking.id);
    this.rejectServiceError.set('');
  }

  closeRejectModal(): void {
    this.rejectingBookingId.set(null);
  }

  async handleRejectConfirm(reason: string): Promise<void> {
    const bookingId = this.rejectingBookingId();
    const booking = this.pendingBookings().find((b) => b.id === bookingId);
    if (!booking) {
      return;
    }

    try {
      await this.bookingsService.rejectBooking(booking.id, reason, booking.userId);
      this.rejectingBookingId.set(null);
      await this.loadPendingBookings();
    } catch {
      this.rejectServiceError.set('Reddetme işlemi başarısız oldu, tekrar deneyin.');
    }
  }
}