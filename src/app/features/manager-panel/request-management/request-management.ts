import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bookings } from '../../../core/services/bookings';
import { Booking } from '../../../models/booking.model';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { AppBadge } from '../../../shared/components/app-badge/app-badge';
import { AppInput } from '../../../shared/components/app-input/app-input';

/**
 * @description Talep Yonetimi sayfasi.
 * (filtreler, talep kartlari, Onayla/Reddet, sayfalama). Ilk versiyon:
 * birim filtrelemesi yok (Resource modelinde henuz department alani yok),
 * tum bekleyen talepler listelenir.
 */
@Component({
  selector: 'app-request-management',
  imports: [FormsModule, AppCard, AppButton, AppBadge, AppInput],
  templateUrl: './request-management.html',
  styleUrl: './request-management.scss',
})
export class RequestManagement implements OnInit {
  private bookingsService = inject(Bookings);

  pendingBookings = signal<Booking[]>([]);
  isLoading = signal(true);

  /** Hangi talebin reddet formu acik, o talebin id'sini tutar; hicbiri acik degilse null. */
  openRejectFormFor = signal<string | null>(null);
  rejectReason = '';
  rejectErrorMessage = signal('');

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

  openRejectForm(booking: Booking): void {
    this.openRejectFormFor.set(booking.id);
    this.rejectReason = '';
    this.rejectErrorMessage.set('');
  }

  cancelRejectForm(): void {
    this.openRejectFormFor.set(null);
  }

  async confirmReject(booking: Booking): Promise<void> {
    if (!this.rejectReason.trim()) {
      this.rejectErrorMessage.set('Gerekçe alanı zorunludur.');
      return;
    }

    await this.bookingsService.rejectBooking(booking.id, this.rejectReason, booking.userId);
    this.openRejectFormFor.set(null);
    await this.loadPendingBookings();
  }
}
