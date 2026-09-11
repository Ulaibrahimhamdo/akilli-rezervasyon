import { Component, Input } from '@angular/core';

/**
 * @description Durum etiketi (badge) component'i.
 * Dumb component'tir — metnini ng-content ile disaridan alir.
 */
@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './app-badge.html',
  styleUrl: './app-badge.scss',
})
export class AppBadge {
  @Input() variant: 'success' | 'warning' | 'danger' = 'success';
}
