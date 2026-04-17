import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { SessionsService } from '../../core/services/sessions.service';
import { TrainingSession } from '../../shared/models/models';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-row" style="margin-bottom: 24px;">
      <h1 class="page-title">STATS<span class="text-accent">.</span></h1>
    </div>
    
    <div class="glass-card" style="margin-bottom: 24px; padding: 24px;">
      <h3 class="text-secondary font-lexend" style="margin-bottom: 24px; font-size: 1rem; letter-spacing: 0.1em; text-transform: uppercase;">Type Distribution</h3>
      <canvas id="typeChart"></canvas>
    </div>

    <div class="metrics-grid">
      <div class="glass-card metric-card" style="flex-direction: column; align-items: flex-start;">
         <h4 class="text-muted font-lexend" style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em;">Total Logs</h4>
         <h2 class="font-lexend">{{ totalSessions }}</h2>
      </div>
      <div class="glass-card metric-card" style="flex-direction: column; align-items: flex-start;">
         <h4 class="text-muted font-lexend" style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em;">Global Time</h4>
         <h2 class="font-lexend">{{ totalMinutes }} <span style="font-size: 1rem; font-weight: 700; color: var(--accent);">MIN</span></h2>
      </div>
    </div>
  `,
  styles: [`
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .metric-card { padding: 24px 16px; }
    h2 { margin-top: 8px; font-size: 3rem; color: var(--text-primary); font-weight: 900; line-height: 1;}
    h4 { margin: 0; font-size: 14px; }
  `]
})
export class StatsComponent implements OnInit {
  sessionsService = inject(SessionsService);
  
  totalSessions = 0;
  totalMinutes = 0;
  chart: Chart | null = null;

  async ngOnInit() {
    const sessions = await this.sessionsService.getSessions(); // Fetch all for global stats
    this.totalSessions = sessions.length;
    this.totalMinutes = sessions.reduce((acc, s) => acc + s.duration_min, 0);

    this.renderChart(sessions);
  }

  renderChart(sessions: TrainingSession[]) {
    const typeCount: Record<string, number> = {};
    sessions.forEach(s => {
      const name = s.type?.name || 'Unknown';
      typeCount[name] = (typeCount[name] || 0) + 1;
    });

    const labels = Object.keys(typeCount);
    const data = Object.values(typeCount);

    const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy();
    
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Sessions',
          data,
          backgroundColor: '#cafd00',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
             beginAtZero: true,
             ticks: { stepSize: 1, color: '#a5abbd', font: { family: 'Inter' } },
             grid: { color: 'rgba(66, 72, 88, 0.15)' },
             border: { display: false }
          },
          x: {
             ticks: { color: '#e0e5f9', font: { family: 'Lexend', weight: 600 } },
             grid: { display: false },
             border: { display: false }
          }
        }
      }
    });
  }
}
