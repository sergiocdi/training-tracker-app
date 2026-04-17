import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <main class="page-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation for logged in users -->
      <nav class="bottom-nav glass-card" *ngIf="auth.currentUser()">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="material-icons">home</span>
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-item">
          <span class="material-icons">list</span>
        </a>
        <a routerLink="/calendar" routerLinkActive="active" class="nav-item">
          <span class="material-icons">calendar_month</span>
        </a>
        <a routerLink="/stats" routerLinkActive="active" class="nav-item">
          <span class="material-icons">bar_chart</span>
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <span class="material-icons">settings</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 12px 20px;
      z-index: 100;
      border-radius: var(--radius-xl);
    }
    
    .nav-item {
      color: var(--text-secondary);
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: color 0.3s ease;
      cursor: pointer;
    }
    
    .nav-item.active {
      color: var(--accent);
    }
    
    .nav-item .material-icons {
      font-size: 28px;
    }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
}
