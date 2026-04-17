import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- TopAppBar -->
    <header class="fixed-top-bar glass-panel flex-row-between" *ngIf="auth.currentUser()">
      <div class="brand-row">
        <div class="avatar-ph"></div>
        <span class="brand-text">Velocity</span>
      </div>
      <button class="bolt-btn">
        <span class="material-symbols-outlined">bolt</span>
      </button>
    </header>

    <div class="app-container">
      <main class="page-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav glass-panel flex-row-around" *ngIf="auth.currentUser()">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="nav-label">Dashboard</span>
      </a>
      <a routerLink="/add-session" routerLinkActive="active" class="nav-item main-action">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">add_circle</span>
        <span class="nav-label">Log</span>
      </a>
      <a routerLink="/history" routerLinkActive="active" class="nav-item">
        <span class="material-symbols-outlined">calendar_month</span>
        <span class="nav-label">History</span>
      </a>
      <a routerLink="/stats" routerLinkActive="active" class="nav-item">
        <span class="material-symbols-outlined">leaderboard</span>
        <span class="nav-label">Stats</span>
      </a>
      <a routerLink="/settings" routerLinkActive="active" class="nav-item">
        <span class="material-symbols-outlined">settings</span>
        <span class="nav-label">Settings</span>
      </a>
    </nav>
  `,
  styles: [`
    .fixed-top-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 50;
      height: 64px !important;
      max-height: 64px !important;
      overflow: hidden;
      padding: 0 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      pointer-events: auto; 
    }
    
    .flex-row-between { display: flex; justify-content: space-between; align-items: center; height: 100%; }
    .flex-row-around { display: flex; justify-content: space-around; align-items: flex-end; }
    
    .brand-row { display: flex; align-items: center; gap: 12px; }
    
    .avatar-ph {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
    }
    
    .brand-text {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: -0.05em;
      color: var(--accent);
    }
    
    .bolt-btn {
      background: transparent;
      border: none;
      color: var(--accent);
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .bolt-btn:hover { background: var(--accent-faded); }
    
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 80px;
      padding-bottom: 16px;
      z-index: 100;
      border-top-left-radius: var(--radius-xl);
      border-top-right-radius: var(--radius-xl);
      box-shadow: 0 -8px 30px rgba(0,0,0,0.3);
      pointer-events: none;
    }
    .bottom-nav > * { pointer-events: auto; }
    
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(224, 229, 249, 0.5); /* on-surface faded */
      text-decoration: none;
      transition: all 0.3s ease-out;
      padding: 8px;
    }
    .nav-item:active { transform: scale(0.9); }
    .nav-item:hover { color: var(--accent); }
    
    .nav-item.active:not(.main-action) { color: var(--accent); }
    
    .nav-label {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 4px;
      opacity: 0.5;
      transition: all 0.3s;
    }
    
    .main-action {
      margin-bottom: 8px;
    }
    .main-action.active, .main-action {
      background: var(--accent);
      color: var(--accent-on);
      border-radius: var(--radius-full);
      padding: 12px;
      transform: scale(1.1);
      box-shadow: var(--shadow-neon);
      opacity: 1;
    }
    .main-action .nav-label { opacity: 1; }
    .main-action:hover { color: var(--accent-on); }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
}
