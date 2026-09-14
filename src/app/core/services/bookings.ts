import { Injectable } from '@angular/core';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
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
}
