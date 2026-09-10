export type ResourceStatus = 'active' | 'inactive';

export interface Resource {
    id: string;
    ad: string;
    bina: string;
    kategori: string;
    kapasite: number;
    durum: ResourceStatus;
}