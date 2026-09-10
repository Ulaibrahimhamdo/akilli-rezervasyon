import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.config';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[];

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.navigate(['/login']);
        resolve(false);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        router.navigate(['/login']);
        resolve(false);
        return;
      }

      const userRole = userDoc.data()['role'];

      if (allowedRoles.includes(userRole)) {
        resolve(true);
      } else {
        router.navigate(['/home']);
        resolve(false);
      }
    });
  });
};