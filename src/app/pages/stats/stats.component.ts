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
    <h1 class="page-title">Statistics</h1>
    
    <div class="glass-card" style="margin-bottom: 24px; padding: 16px;">
      <h3 class="text-secondary" style="margin-bottom: 16px; font-size: 16px;">Distribution by Type</h3>
      <canvas id="typeChart"></canvas>
    </div>

    <div class="metrics-grid">
      <div class="glass-card metric-card" style="flex-direction: column; align-items: flex-start;">
         <h4 class="text-muted">Total Sessions</h4>
         <h2>{{ totalSessions }}</h2>
      </div>
      <div class="glass-card metric-card" style="flex-direction: column; align-items: flex-start;">
         <h4 class="text-muted">Total Duration</h4>
         <h2>{{ totalMinutes }} <span style="font-size: 14px; font-weight: normal;">min</span></h2>
      </div>
    </div>
  `,
  styles: [`
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .metric-card { padding: 24px 16px; }
    h2 { margin-top: 8px; font-size: 28px; color: var(--accent); }
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
          backgroundColor: '#AAFF00',
          borderRadius: 4
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
             ticks: { stepSize: 1, color: '#A0A0A0' },
             grid: { color: 'rgba(255,255,255,0.05)' }
          },
          x: {
             ticks: { color: '#F4F4F4' },
             grid: { display: false }
          }
        }
      }
    });
  }
}
