import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppCard } from '../../../shared/components/app-card/app-card';
import { AppButton } from '../../../shared/components/app-button/app-button';
import { AppBadge } from '../../../shared/components/app-badge/app-badge';
import { AppAvatar } from '../../../shared/components/app-avatar/app-avatar';

export interface UrgentBookingInfo {
  booking: { id: string; purpose: string; userId: string };
  resourceName: string;
  periodLabel: string;
  requesterName: string;
  requesterRoleLabel: string;
  studentNumber: string | null;
  hoursRemaining: number;
}

/**
 * @description Kilit Modali. Rezervasyon baslangicina 48 saatten (SystemSettings'ten
 * okunan managerResponseHours) az kalmis, hala pending durumdaki talepleri gosterir.
 * Yonetici bu talebe cevap vermeden (Onayla/Reddet) modal kapanamaz — tum paneli kilitler.
 * Presentational (dumb) component'tir, karari disariya bildirir.
 */
@Component({
  selector: 'app-lock-modal',
  imports: [AppCard, AppButton, AppBadge, AppAvatar],
  templateUrl: './lock-modal.html',
  styleUrl: './lock-modal.scss',
})
export class LockModal {
  /** Su an gosterilecek acil talep; null ise modal kapali. */
  @Input() urgentBooking: UrgentBookingInfo | null = null;

  /** Kacinci acil talep gosteriliyor (1'den baslar). */
  @Input() currentIndex = 1;

  /** Toplam kac acil talep var. */
  @Input() totalCount = 1;

  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  formatHours(hours: number): string {
    if (hours < 0) {
      return 'Süre doldu';
    }
    return `Son ${Math.floor(hours)} saat`;
  }
}