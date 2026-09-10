import { Injectable } from '@angular/core';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { SystemSettings as SystemSettingsModel } from '../../models/system-settings.model';

const DEFAULT_SETTINGS: SystemSettingsModel = {
  monthlyLimit: 3,
  managerResponseHours: 48,
  cancelDeadlineHours: 24,
};

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
}
