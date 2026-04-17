import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { AuthService } from '../../core/services/auth.service';
import { SessionsService } from '../../core/services/sessions.service';
import { SettingsService } from '../../core/services/settings.service';
import { TrainingSession, UserSettings } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-row">
      <div>
        <h1 class="page-title" style="margin-bottom: 4px;">Hello, Friend</h1>
        <p class="text-secondary">Ready to work out?</p>
      </div>
      <button class="btn-icon" (click)="logout()" title="Logout">
        <span class="material-icons">logout</span>
      </button>
    </div>

    <!-- Score Circular Card -->
    <div class="glass-card score-card" style="text-align: center; margin-bottom: 24px;">
      <h3 class="text-secondary" style="margin-bottom: 16px;">Wellness Score</h3>
      
      <div class="score-circle-container">
         <canvas id="scoreChart"></canvas>
         <div class="score-value">
            <h2>{{ score }}%</h2>
         </div>
      </div>
      
      <p class="motivational-quote text-accent" style="margin-top: 16px; font-weight: 500;">
        {{ motivationalQuote }}
      </p>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-grid">
      <div class="glass-card metric-card">
        <div class="metric-icon"><span class="material-icons">directions_run</span></div>
        <div class="metric-info">
          <h4>Sessions</h4>
          <p class="text-muted">{{ weekSessions }} / {{ settings?.weekly_sessions_goal }}</p>
        </div>
      </div>
      
      <div class="glass-card metric-card">
        <div class="metric-icon"><span class="material-icons">timer</span></div>
        <div class="metric-info">
          <h4>Minutes</h4>
          <p class="text-muted">{{ weekMinutes }} / {{ settings?.weekly_minutes_goal }}</p>
        </div>
      </div>
    </div>

    <button class="btn-primary w-100" style="margin-top: 24px; padding: 18px; font-size: 18px;" routerLink="/add-session">
      <span class="material-icons">add</span> Add New Session
    </button>
  `,
  styles: [`
    .score-card { position: relative; }
    .score-circle-container {
      position: relative;
      width: 180px;
      height: 180px;
      margin: 0 auto;
    }
    .score-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      h2 { font-size: 36px; font-weight: 700; color: var(--text-primary); }
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }
    .metric-icon {
      background: var(--accent-faded);
      color: var(--accent);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-info h4 { font-size: 14px; margin-bottom: 4px;}
    .metric-info p { font-size: 13px; margin: 0; }
    .w-100 { width: 100%; }
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

  private chart: Chart | null = null;

  async ngOnInit() {
    this.settings = await this.settingsService.getSettings();
    await this.calculateWeeklyStats();
    this.initChart();
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
    if (score === 0) return "Hoy es un buen día para empezar: una sesión cuenta.";
    if (score < 40) return "Pequeños pasos, gran progreso.";
    if (score < 70) return "Vas en camino: intenta sumar una sesión más.";
    if (score < 90) return "Constancia excelente, sigue así.";
    return "Semana top: tu cuerpo te lo agradece.";
  }

  initChart() {
    const ctx = document.getElementById('scoreChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy();
    
    const remainder = 100 - this.score;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [this.score, remainder],
          backgroundColor: [
            '#AAFF00', // accent
            'rgba(255, 255, 255, 0.05)'
          ],
          borderWidth: 0,
          borderRadius: 10
        }]
      },
      options: {
        cutout: '80%',
        responsive: true,
        plugins: { tooltip: { enabled: false } },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }

  async logout() {
    await this.auth.signOut();
  }
}
