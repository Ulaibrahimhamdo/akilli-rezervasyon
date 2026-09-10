export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
    id: string;
    userId: string;
    resourceId: string;
    date: string;
    periodIds: string[];
    status: BookingStatus;
    purpose: string;
    equipmentRequest?: string;
    rejectionReason?: string;
    createdAt: Date;
}