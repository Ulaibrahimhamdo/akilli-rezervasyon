import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../core/firebase.config';
import { Auth } from '../../core/services/auth';
import { Notifications as NotificationsService } from '../../core/services/notifications';
import { User } from '../../models/user.model';
import { AppAvatar } from '../../shared/components/app-avatar/app-avatar';

/**
 * @description Admin Paneli ana kabugu. Belge Bolum 8'deki Sidebar tanimina uyar
 * (avatar+isim+rol, 5 menu ogesi, bildirim sayaci). Child routes ile kurulmustur —
 * sidebar sabit kalir, sag taraf (router-outlet) route'a gore degisir.
 */
@Component({
  selector: 'app-admin-panel',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, AppAvatar],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel implements OnInit {
  private authService = inject(Auth);
  private notificationsService = inject(NotificationsService);

  currentUser = signal<User | null>(null);
  unreadCount = signal(0);

  ngOnInit(): void {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }
      const profile = await this.authService.getUserProfile(user.uid);
      this.currentUser.set(profile);

      const count = await this.notificationsService.getUnreadCount(user.uid);
      this.unreadCount.set(count);
    });
  }
}