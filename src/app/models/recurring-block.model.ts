export interface RecurringBlock {
    id: string;
    resourceId: string;
    dayOfWeek: number;
    periodIds: string[];
    label: string;
}