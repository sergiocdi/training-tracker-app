import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsService } from '../../core/services/sessions.service';
import { TrainingSession } from '../../shared/models/models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-row" style="margin-bottom: 32px;">
      <h1 class="page-title text-transform:uppercase;">{{ currentMonthName }}<span class="text-accent">.</span></h1>
      <div style="display:flex; gap:8px;">
         <button class="icon-btn" style="border:1px solid var(--border-color); background:var(--bg-surface); padding:8px; border-radius:50%;" (click)="addMonth(-1)"><span class="material-symbols-outlined">chevron_left</span></button>
         <button class="icon-btn" style="border:1px solid var(--border-color); background:var(--bg-surface); padding:8px; border-radius:50%;" (click)="addMonth(1)"><span class="material-symbols-outlined">chevron_right</span></button>
      </div>
    </div>

    <div class="glass-card calendar-card" style="padding: 24px;">
      <div class="calendar-grid days-header">
         <div *ngFor="let day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']">{{ day | slice:0:1 }}</div>
      </div>
      <div class="calendar-grid">
         <div *ngFor="let d of emptyDays" class="empty-cell"></div>
         <div *ngFor="let day of monthDays" 
              class="calendar-day" 
              [class.has-session]="hasSession(day)"
              [class.today]="isToday(day)">
            <span class="day-num">{{ day }}</span>
            <div class="dot" *ngIf="hasSession(day)"></div>
         </div>
      </div>
    </div>
    
    <div class="glass-card" style="margin-top: 24px;" *ngIf="sessionsThisMonth.length > 0">
       <div style="display:flex; justify-content:space-between; align-items:center;">
         <h3 class="text-secondary font-lexend" style="margin: 0; font-size:1.1rem; letter-spacing: 0.1em;">MONTH SUMMARY</h3>
         <h2 class="text-accent font-lexend" style="margin:0; font-size: 2.5rem; line-height: 1;">{{ sessionsThisMonth.length }}</h2>
       </div>
    </div>
  `,
  styles: [`
    .icon-btn { color: var(--text-primary); cursor: pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;}
    .icon-btn:hover { background: var(--bg-surface-elevated); color: var(--accent); }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 12px;
      text-align: center;
    }
    .days-header {
      font-size: 0.8rem;
      font-family: 'Lexend', sans-serif;
      color: var(--text-muted);
      margin-bottom: 16px;
      font-weight: 700;
    }
    .empty-cell {
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-sm);
      opacity: 0.3;
    }
    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background: var(--bg-surface-elevated);
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .calendar-day:hover { background: var(--bg-surface-bright); transform: scale(1.05); }
    .calendar-day.today {
      border: 2px solid var(--secondary);
    }
    .day-num { font-family: 'Lexend', sans-serif; font-weight: 600; font-size: 1rem; }
    .calendar-day.has-session .day-num {
      color: var(--accent);
      font-weight: 900;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: var(--accent);
      border-radius: 50%;
      position: absolute;
      bottom: 6px;
      box-shadow: var(--shadow-neon);
    }
  `]
})
export class CalendarComponent implements OnInit {
  sessionsService = inject(SessionsService);
  
  currentDate = new Date();
  monthDays: number[] = [];
  emptyDays: number[] = [];
  sessionsThisMonth: TrainingSession[] = [];

  get currentMonthName() {
    return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  async ngOnInit() {
    await this.generateCalendar();
  }

  async addMonth(delta: number) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    await this.generateCalendar();
  }

  async generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // adjust for monday start
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;
    
    this.emptyDays = Array(startDayIdx).fill(0);
    this.monthDays = Array.from({length: lastDay.getDate()}, (_, i) => i + 1);

    // fetch dates
    const s = new Date(year, month, 1).toISOString();
    const e = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    this.sessionsThisMonth = await this.sessionsService.getSessions(s, e);
  }

  hasSession(day: number) {
    const targetDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day).toDateString();
    return this.sessionsThisMonth.some(s => new Date(s.started_at).toDateString() === targetDate);
  }

  isToday(day: number) {
    const today = new Date();
    return this.currentDate.getFullYear() === today.getFullYear() &&
           this.currentDate.getMonth() === today.getMonth() &&
           day === today.getDate();
  }
}
