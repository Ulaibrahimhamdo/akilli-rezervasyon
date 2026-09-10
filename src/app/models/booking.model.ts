/**
 * @description Status of the appointment
 */
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

/**
 * @description Model of the aapointment of a place
 */
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