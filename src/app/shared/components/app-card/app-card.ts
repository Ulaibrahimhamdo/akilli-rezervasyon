import { Component, Input } from '@angular/core';

/**
 * @description Ortak kart (kutu) component'i.
 * Dumb component'tir — icerigi tamamen disaridan (ng-content ile) gelir.
 */
@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './app-card.html',
  styleUrl: './app-card.scss',
})
export class AppCard {
  @Input() modalPadding = false;
} { }
