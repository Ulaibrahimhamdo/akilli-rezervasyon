import { Component, Input } from '@angular/core';
import { UserRole } from '../../../models/user.model';

/**
 * @description Kullanici avatar component'i.
 * Rol renklerine gore arka plan/metin rengi degisir, ismin bas harfini gosterir.
 */
@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './app-avatar.html',
  styleUrl: './app-avatar.scss',
})
export class AppAvatar {
  /** Avatarin rengini belirleyen kullanici rolu. */
  @Input() role: UserRole = 'student';

  /** Bas harfi cikarilacak isim (orn: "Ahmet Yilmaz" -> "A"). */
  @Input() name = '';

  get initial(): string {
    return this.name.trim().charAt(0).toUpperCase();
  }
}
