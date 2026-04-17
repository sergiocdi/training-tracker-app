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
    <div class="header-row" style="margin-bottom: 24px;">
      <h1 class="page-title">HISTORY<span class="text-accent">.</span></h1>
      <button class="btn-icon" routerLink="/calendar" style="border:none; background: transparent;">
        <span class="material-symbols-outlined">calendar_month</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="glass-card flex-row-between" style="padding: 12px 16px; margin-bottom: 32px; border-radius: var(--radius-full);">
       <div class="filter-label"><span class="material-symbols-outlined">filter_list</span> Filter</div>
       <input type="month" class="form-control filter-input" (change)="onMonthChange($event)">
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="empty-state">
       <span class="material-symbols-outlined text-muted" style="font-size: 32px; animation: pulse 1.5s infinite;">hourglass_empty</span>
       <p class="text-secondary" style="margin-top: 16px; font-family: 'Lexend', sans-serif;">SYNCING...</p>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading && sessions.length === 0" class="empty-state glass-card">
       <span class="material-symbols-outlined text-muted" style="font-size: 48px; margin-bottom: 16px;">history</span>
       <h3 class="text-primary font-lexend" style="font-size: 1.5rem; margin-bottom: 8px;">NO LOGS FOUND</h3>
       <p class="text-muted text-center">You haven't tracked any activity for this period.</p>
    </div>

    <!-- Sessions List -->
    <div *ngIf="!loading && sessions.length > 0" class="sessions-list">
      <div *ngFor="let s of sessions" class="glass-card session-card pulse-hover">
        
        <div class="session-header">
          <div class="sport-badge">
             <span class="material-symbols-outlined">{{ s.type?.icon || 'exercise' }}</span>
          </div>
          <div class="session-meta">
             <span class="session-date">{{ s.started_at | date:'MMM dd, yyyy' }}</span>
             <span class="session-time">{{ s.started_at | date:'h:mm a' }}</span>
          </div>
          <button class="icon-btn text-danger delete-btn" (click)="deleteSession(s.id)" title="Delete">
              <span class="material-symbols-outlined">delete_outline</span>
          </button>
        </div>
        
        <div class="session-body">
           <div>
             <h4 class="font-lexend text-primary" style="font-size: 1.25rem;">{{ s.type?.name || 'Unknown' }}</h4>
             <div class="badges-row" style="margin-top: 8px;">
                <span class="intensity-badge" *ngIf="s.intensity">Int {{ s.intensity }}/10</span>
             </div>
           </div>
           
           <div class="duration-display">
             <span class="dur-val">{{ s.duration_min }}</span>
             <span class="dur-unit">MIN</span>
           </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .flex-row-between { display: flex; justify-content: space-between; align-items: center; }
    .filter-label { display: flex; align-items: center; gap: 8px; font-family: 'Lexend', sans-serif; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; font-size: 0.8rem; }
    .filter-input { width: auto; border: none; padding: 4px; background: transparent; color: var(--accent); font-weight: 700; font-family: 'Lexend', sans-serif;}
    .filter-input:focus { border:none; box-shadow:none; }
    
    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px 24px; text-align: center;
    }
    
    .sessions-list { display: flex; flex-direction: column; gap: 24px; }
    
    .session-card {
      padding: 24px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .pulse-hover:hover {
      box-shadow: var(--shadow-neon);
      border-color: var(--accent);
    }
    
    .session-header {
      display: flex; align-items: center; gap: 16px; width: 100%;
    }
    
    .sport-badge {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--accent-faded); color: var(--accent);
      display: flex; align-items: center; justify-content: center;
    }
    
    .session-meta { display: flex; flex-direction: column; flex: 1; }
    .session-date { font-family: 'Lexend', sans-serif; font-weight: 700; color: var(--text-primary); font-size: 0.9rem; }
    .session-time { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    
    .delete-btn { background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 50%; transition: 0.2s;}
    .delete-btn:hover { background: var(--danger-faded); color: var(--danger); }
    
    .session-body {
      display: flex; justify-content: space-between; align-items: flex-end;
    }
    
    .badges-row { display: flex; gap: 8px; }
    .intensity-badge {
      background: var(--bg-surface-elevated); padding: 4px 8px; border-radius: var(--radius-sm);
      font-size: 0.7rem; font-weight: 700; font-family: 'Lexend', sans-serif; color: var(--text-secondary);
      border: 1px solid var(--border-color); text-transform: uppercase;
    }
    
    .duration-display { display: flex; align-items: baseline; gap: 4px; }
    .dur-val { font-family: 'Lexend', sans-serif; font-size: 3.5rem; font-weight: 900; line-height: 1; color: var(--text-primary); text-shadow: var(--shadow-neon); }
    .dur-unit { font-family: 'Lexend', sans-serif; font-size: 1rem; font-weight: 700; color: var(--accent); }
    
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0.5; }
    }
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
