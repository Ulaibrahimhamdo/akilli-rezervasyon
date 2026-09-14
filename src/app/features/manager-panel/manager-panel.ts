import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../core/firebase.config';
import { Auth } from '../../core/services/auth';
import { Notifications as NotificationsService } from '../../core/services/notifications';
import { User } from '../../models/user.model';
import { AppAvatar } from '../../shared/components/app-avatar/app-avatar';

/**
 * @description Yonetici Paneli ana kabugu. Belge Bolum 8'deki Sidebar tanimina uyar
 * (avatar+isim+rol, 4 menu ogesi, bildirim sayaci).
 */
@Component({
  selector: 'app-manager-panel',
  imports: [RouterLink, AppAvatar],
  templateUrl: './manager-panel.html',
  styleUrl: './manager-panel.scss',
})
export class ManagerPanel implements OnInit {
  private authService = inject(Auth);
  private notificationsService = inject(NotificationsService);

  currentUser = signal<User | null>(null);
  unreadCount = signal(0);
  activeSection = signal<'requests' | 'resources'>('requests');

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

  setSection(section: 'requests' | 'resources'): void {
    this.activeSection.set(section);
  }
}
