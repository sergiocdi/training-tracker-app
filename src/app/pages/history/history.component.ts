import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionsService } from '../../core/services/sessions.service';
import { TrainingSession } from '../../shared/models/models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-row">
      <h1 class="page-title" style="margin-bottom: 0;">Activity History</h1>
    </div>

    <div class="filters glass-card" style="margin-bottom: 24px; padding: 16px;">
       <!-- Simplistic filters for now -->
       <input type="month" class="form-control" (change)="onMonthChange($event)" style="width: 100%; margin-bottom: 0;">
    </div>

    <!-- loading state -->
    <p *ngIf="loading" class="text-secondary text-center">Loading sessions...</p>

    <!-- empty state -->
    <div *ngIf="!loading && sessions.length === 0" class="glass-card" style="text-align: center; padding: 40px 20px;">
       <span class="material-icons text-muted" style="font-size: 48px; margin-bottom: 16px;">history</span>
       <h3 class="text-secondary">No sessions found</h3>
       <p class="text-muted">You haven't logged any activity in this period.</p>
    </div>

    <!-- Sessions List -->
    <div *ngIf="!loading && sessions.length > 0" class="sessions-list">
      <div *ngFor="let s of sessions" class="glass-card session-card">
        
        <div class="session-icon">
           <span class="material-icons">{{ s.type?.icon || 'fitness_center' }}</span>
        </div>
        
        <div class="session-details">
           <h4 style="margin-bottom: 4px;">{{ s.type?.name || 'Unknown Type' }}</h4>
           <p class="text-muted" style="margin: 0; font-size: 13px;">
              {{ s.started_at | date:'medium' }} • {{ s.duration_min }} mins
           </p>
           <p class="text-accent" *ngIf="s.intensity" style="font-size: 12px; margin-top: 4px; font-weight: 600;">
              Intensity: {{ s.intensity }}/10
           </p>
        </div>

        <div class="session-actions">
           <button class="icon-btn text-danger" (click)="deleteSession(s.id)" title="Delete">
              <span class="material-icons">delete</span>
           </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .session-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .session-icon {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);
    }
    .session-details {
      flex: 1;
    }
    .session-actions {
      display: flex;
      gap: 8px;
    }
    .icon-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: background 0.2s;
    }
    .icon-btn:hover {
      background: var(--bg-surface-elevated);
    }
    .text-center { text-align: center; }
  `]
})
export class HistoryComponent implements OnInit {
  sessionsService = inject(SessionsService);
  
  sessions: TrainingSession[] = [];
  loading = true;

  async ngOnInit() {
    await this.fetchSessions();
  }

  async fetchSessions(start?: string, end?: string) {
    this.loading = true;
    try {
      this.sessions = await this.sessionsService.getSessions(start, end);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  onMonthChange(event: any) {
    const val = event.target.value;
    if (!val) {
      this.fetchSessions();
      return;
    }
    
    // val is "YYYY-MM"
    const [year, month] = val.split('-');
    const start = new Date(year, month - 1, 1).toISOString();
    const end = new Date(year, month, 0, 23, 59, 59).toISOString();
    
    this.fetchSessions(start, end);
  }

  async deleteSession(id: string) {
    if(!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await this.sessionsService.deleteSession(id);
      this.sessions = await this.sessionsService.getSessions(); // trigger re-fetch?
      // better yet, just remove from array
      this.sessions = this.sessions.filter(s => s.id !== id);
    } catch (err) {
      console.error('Error deleting session', err);
    }
  }
}
