import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '../firebase.config';
import { User, UserRole } from '../../models/user.model';

function detectRole(email: string): UserRole {
  const localPart = email.split('@')[0];
  const isOnlyDigits = /^[0-9]+$/.test(localPart);
  return isOnlyDigits ? 'student' : 'academic';
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  async register(email: string, password: string, adSoyad: string, telefon: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const role = detectRole(email);

    const newUser: User = {
      uid: credential.user.uid,
      adSoyad,
      email,
      telefon,
      role,
    };

    await setDoc(doc(db, 'users', credential.user.uid), newUser);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(firebaseAuth, email);
  }
  async getUserProfile(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }
    return userDoc.data() as User;
  }

  async updateUserProfile(uid: string, data: Partial<Pick<User, 'adSoyad' | 'telefon'>>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), data);
  }

  async changePassword(newPassword: string): Promise<void> {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('Kullanıcı giriş yapmamış.');
    }
    await updatePassword(currentUser, newPassword);
  }
}