import { Injectable } from '@angular/core';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Booking } from '../../models/booking.model';

/**
 * @description Rezervasyon (booking) servisi. Yoneticinin bekleyen talepleri okumasi,
 * onaylamasi ve gerekce ile reddetmesi icin gerekli islemleri icerir.
 */
@Injectable({
  providedIn: 'root',
})
export class Bookings {
  async getPendingBookings(): Promise<Booking[]> {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as Booking),
      id: docSnap.id,
    }));
  }

  async approveBooking(bookingId: string): Promise<void> {
    await updateDoc(doc(db, 'bookings', bookingId), { status: 'approved' });
  }

  async rejectBooking(bookingId: string, reason: string, userId: string): Promise<void> {
    if (!reason.trim()) {
      throw new Error('Reddetme gerekçesi zorunludur.');
    }

    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'rejected',
      rejectionReason: reason,
    });

    await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'rejection',
      message: `Rezervasyon talebiniz reddedildi: ${reason}`,
      read: false,
      createdAt: Timestamp.now(),
      relatedBookingId: bookingId,
    });
  }
  async getUrgentPendingBookings(thresholdHours: number): Promise<{
    booking: Booking;
    resourceName: string;
    periodLabel: string;
    requesterName: string;
    requesterRoleLabel: string;
    studentNumber: string | null;
    hoursRemaining: number;
  }[]> {
    const pendingBookings = await this.getPendingBookings();

    const periodsSnapshot = await getDocs(collection(db, 'periods'));
    const periodsById = new Map(
      periodsSnapshot.docs.map((d) => [d.id, d.data() as { label: string; order: number }])
    );

    const now = new Date();
    const enriched: {
      booking: Booking;
      resourceName: string;
      periodLabel: string;
      requesterName: string;
      requesterRoleLabel: string;
      studentNumber: string | null;
      hoursRemaining: number;
    }[] = [];

    for (const booking of pendingBookings) {
      const bookingPeriods = booking.periodIds
        .map((id) => periodsById.get(id))
        .filter((p): p is { label: string; order: number } => !!p)
        .sort((a, b) => a.order - b.order);

      if (bookingPeriods.length === 0) {
        continue;
      }

      const startTime = bookingPeriods[0].label.split('-')[0].trim();
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(booking.date);
      startDateTime.setHours(hours, minutes, 0, 0);

      const hoursRemaining = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursRemaining > thresholdHours) {
        continue;
      }

      const [resourceDoc, userDoc] = await Promise.all([
        getDoc(doc(db, 'resources', booking.resourceId)),
        getDoc(doc(db, 'users', booking.userId)),
      ]);

      const resourceName = resourceDoc.exists() ? (resourceDoc.data()['ad'] as string) : 'Bilinmeyen mekan';
      const userData = userDoc.exists() ? userDoc.data() : null;
      const requesterName = userData ? (userData['adSoyad'] as string) : 'Bilinmeyen kullanıcı';
      const role = userData ? (userData['role'] as string) : '';
      const email = userData ? (userData['email'] as string) : '';

      const requesterRoleLabel = role === 'student' ? 'Öğrenci' : 'Akademisyen';
      const studentNumber = role === 'student' ? email.split('@')[0] : null;

      enriched.push({
        booking,
        resourceName,
        periodLabel: bookingPeriods.map((p) => p.label).join(', '),
        requesterName,
        requesterRoleLabel,
        studentNumber,
        hoursRemaining,
      });
    }

    return enriched.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  }
}
