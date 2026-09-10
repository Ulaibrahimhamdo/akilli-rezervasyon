export type NotificationType = 'approval' | 'rejection' | 'reminder' | 'lock';

export interface AppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    message: string;
    read: boolean;
    createdAt: Date;
    relatedBookingId?: string;
}