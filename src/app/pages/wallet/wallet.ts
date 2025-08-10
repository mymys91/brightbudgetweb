import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LayoutComponent } from '../../shared/layout';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    LayoutComponent
  ],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss'
})
export class WalletComponent {
  // Wallet component logic will go here
}
