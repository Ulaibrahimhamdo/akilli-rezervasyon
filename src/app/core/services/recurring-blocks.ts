import { Injectable } from '@angular/core';
import { collection, getDocs, query, where, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { RecurringBlock } from '../../models/recurring-block.model';

/**
 * @description Ders Programi (RecurringBlock) servisi. Belirli bir kaynagin
 * haftalik sabit ders bloklarini eklemek, listelemek ve silmek icin kullanilir.
 * Bu bloklar, kaynagin takviminde otomatik "dolu" olarak gorunur.
 */
@Injectable({
  providedIn: 'root',
})
export class RecurringBlocks {
  async getBlocksForResource(resourceId: string): Promise<RecurringBlock[]> {
    const blocksRef = collection(db, 'recurringBlocks');
    const q = query(blocksRef, where('resourceId', '==', resourceId));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      ...(d.data() as RecurringBlock),
      id: d.id,
    }));
  }

  async createBlock(data: Omit<RecurringBlock, 'id'>): Promise<void> {
    await addDoc(collection(db, 'recurringBlocks'), data);
  }

  async deleteBlock(id: string): Promise<void> {
    await deleteDoc(doc(db, 'recurringBlocks', id));
  }
}