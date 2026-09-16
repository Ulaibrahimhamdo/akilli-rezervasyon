import { Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { SystemSettings as SystemSettingsModel } from '../../models/system-settings.model';

const DEFAULT_SETTINGS: SystemSettingsModel = {
  monthlyLimit: 3,
  managerResponseHours: 48,
  cancelDeadlineHours: 24,
};

/**
 * @description Sistem Ayarlari servisi. Kampus genelinde gecerli kurallari
 * (aylik rezervasyon limiti, yonetici cevap suresi, iptal son suresi)
 * Firestore'dan okur ve gunceller. Degerler hard-coded degildir.
 */
@Injectable({
  providedIn: 'root',
})
export class SystemSettings {
  async getSettings(): Promise<SystemSettingsModel> {
    const settingsDoc = await getDoc(doc(db, 'systemSettings', 'default'));

    if (!settingsDoc.exists()) {
      return DEFAULT_SETTINGS;
    }

    return settingsDoc.data() as SystemSettingsModel;
  }

  async updateSettings(settings: SystemSettingsModel): Promise<void> {
    await setDoc(doc(db, 'systemSettings', 'default'), settings);
  }
}