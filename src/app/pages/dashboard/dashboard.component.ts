import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SessionsService } from '../../core/services/sessions.service';
import { SettingsService } from '../../core/services/settings.service';
import { TrainingSession, UserSettings } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-row" style="margin-bottom: 24px;">
      <div>
        <h1 class="page-title" style="margin-bottom: 0;">Hello, Athlete.</h1>
        <p class="text-secondary" style="font-weight: 500;">Ready to crush your goals?</p>
      </div>
      <button class="btn-icon" (click)="logout()" title="Logout" style="border: none;">
        <span class="material-symbols-outlined">logout</span>
      </button>
    </div>

    <!-- Score Circular Card -->
    <div class="glass-card score-hero">
      <div class="score-circle-wrapper">
        <svg viewBox="0 0 36 36" class="circular-chart">
          <path class="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path class="circle-fg"
            [attr.stroke-dasharray]="score + ', 100'"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div class="score-content">
          <span class="score-label">WELLNESS SCORE</span>
          <h2 class="score-value">{{ score }}</h2>
        </div>
      </div>
      
      <p class="motivational-quote text-accent">{{ motivationalQuote }}</p>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-grid">
      <div class="glass-card metric-card">
        <div class="metric-icon-wrap">
           <span class="material-symbols-outlined">exercise</span>
        </div>
        <div class="metric-info">
          <h4>Sessions</h4>
          <div class="metric-value">
             <span class="current">{{ weekSessions }}</span>
             <span class="goal">/ {{ settings?.weekly_sessions_goal }}</span>
          </div>
        </div>
      </div>
      
      <div class="glass-card metric-card">
        <div class="metric-icon-wrap" style="color: var(--secondary); background: var(--danger-faded);">
           <span class="material-symbols-outlined">timer</span>
        </div>
        <div class="metric-info">
          <h4>Minutes</h4>
          <div class="metric-value">
             <span class="current">{{ weekMinutes }}</span>
             <span class="goal">/ {{ settings?.weekly_minutes_goal }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .score-hero {
      text-align: center;
      margin-bottom: 24px;
      padding: 32px 24px;
      background: linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%);
    }
    .score-circle-wrapper {
      position: relative;
      max-width: 220px;
      margin: 0 auto 24px;
    }
    .circular-chart {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      max-height: 250px;
      filter: drop-shadow(0 0 12px rgba(243, 255, 202, 0.2));
    }
    .circle-bg {
      fill: none;
      stroke: var(--bg-surface-elevated);
      stroke-width: 2;
    }
    .circle-fg {
      fill: none;
      stroke: var(--accent);
      stroke-width: 2;
      stroke-linecap: round;
      transition: stroke-dasharray 1s ease-out;
    }
    .score-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .score-label {
      font-size: 0.65rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .score-value {
      font-family: 'Lexend', sans-serif;
      font-size: 4rem;
      font-weight: 900;
      line-height: 1;
      color: var(--text-primary);
    }
    .motivational-quote {
      font-family: 'Lexend', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .metric-card {
      display: flex;
      flex-direction: column;
      padding: 20px;
      gap: 12px;
    }
    .metric-icon-wrap {
      background: var(--accent-faded);
      color: var(--accent);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-info h4 {
      font-family: 'Lexend', sans-serif;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .metric-value .current { font-size: 1.5rem; font-weight: 900; color: var(--text-primary); font-family: 'Lexend', sans-serif;}
    .metric-value .goal { font-size: 0.9rem; font-weight: 500; color: var(--text-muted); }
  `]
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private sessionsService = inject(SessionsService);
  private settingsService = inject(SettingsService);

  settings: UserSettings | null = null;
  weekSessions = 0;
  weekMinutes = 0;
  score = 0;
  motivationalQuote = '';

  async ngOnInit() {
    this.settings = await this.settingsService.getSettings();
    await this.calculateWeeklyStats();
  }

  async calculateWeeklyStats() {
    const { start, end } = this.getCurrentWeekRange();
    const sessions = await this.sessionsService.getSessions(start.toISOString(), end.toISOString());
    
    this.weekSessions = sessions.length;
    this.weekMinutes = sessions.reduce((acc, s) => acc + s.duration_min, 0);

    if (this.settings) {
      // Calculation defined in DRFT
      const maxSessions = this.settings.weekly_sessions_goal;
      const maxMins = this.settings.weekly_minutes_goal;
      
      const scoreFreq = Math.min(100, Math.round((this.weekSessions / maxSessions) * 100));
      const scoreDur = Math.min(100, Math.round((this.weekMinutes / maxMins) * 100));
      
      this.score = Math.round(
         (this.settings.score_weight_frequency * scoreFreq) + 
         (this.settings.score_weight_duration * scoreDur)
      );
      
      this.motivationalQuote = this.getQuote(this.score);
    }
  }

  getCurrentWeekRange() {
    const curr = new Date();
    // Week starts on Monday
    const day = curr.getDay();
    const first = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    const last = first + 6;
    
    const start = new Date(curr.setDate(first));
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(curr.setDate(last));
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  getQuote(score: number): string {
    if (score === 0) return "Ready to start? One session counts.";
    if (score < 40) return "Small steps, big progress.";
    if (score < 70) return "You're getting there. Keep going!";
    if (score < 90) return "Excellent consistency, keep it up!";
    return "Top performance. Your body thanks you.";
  }

  async logout() {
    await this.auth.signOut();
  }
}
