import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsService } from '../../core/services/sessions.service';
import { TrainingSession } from '../../shared/models/models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-row">
      <h1 class="page-title" style="margin-bottom: 0;">{{ currentMonthName }}</h1>
      <div>
         <button class="icon-btn" (click)="addMonth(-1)"><span class="material-icons">chevron_left</span></button>
         <button class="icon-btn" (click)="addMonth(1)"><span class="material-icons">chevron_right</span></button>
      </div>
    </div>

    <div class="glass-card" style="padding: 16px;">
      <div class="calendar-grid days-header">
         <div *ngFor="let day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']">{{ day }}</div>
      </div>
      <div class="calendar-grid">
         <div *ngFor="let d of emptyDays"></div>
         <div *ngFor="let day of monthDays" 
              class="calendar-day" 
              [class.has-session]="hasSession(day)"
              [class.today]="isToday(day)">
            <span class="day-num">{{ day }}</span>
            <div class="dot" *ngIf="hasSession(day)"></div>
         </div>
      </div>
    </div>
    
    <div style="margin-top: 24px;" *ngIf="sessionsThisMonth.length > 0">
       <h3 class="text-secondary" style="margin-bottom: 16px;">Summary</h3>
       <p class="text-muted">{{ sessionsThisMonth.length }} sessions this month.</p>
    </div>
  `,
  styles: [`
    .icon-btn { background: transparent; border: none; color: var(--text-primary); cursor: pointer; }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      text-align: center;
    }
    .days-header {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
      font-weight: 600;
    }
    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      position: relative;
    }
    .calendar-day.today {
      border: 1px solid var(--accent);
    }
    .calendar-day.has-session .day-num {
      color: var(--accent);
      font-weight: 600;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: var(--accent);
      border-radius: 50%;
      position: absolute;
      bottom: 6px;
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
