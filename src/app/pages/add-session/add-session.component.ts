import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionsService } from '../../core/services/sessions.service';
import { TypesService } from '../../core/services/types.service';
import { TrainingType } from '../../shared/models/models';

@Component({
  selector: 'app-add-session',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="header-row" style="margin-bottom: 24px;">
      <h1 class="page-title">LOG<br><span class="text-accent">SESSION</span></h1>
      <button class="btn-icon" routerLink="/dashboard" style="border:none; background: transparent;">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <form [formGroup]="sessionForm" (ngSubmit)="submit()">
      
      <!-- Sport Selector -->
      <div class="form-group" style="margin-bottom: 32px;">
        <label class="form-label">Activity Type</label>
        <div class="sport-selector">
          <div class="sport-item" 
               *ngFor="let t of activeTypes"
               [class.active]="sessionForm.value.type_id === t.id"
               (click)="sessionForm.patchValue({type_id: t.id})">
            <div class="sport-icon">
              <span class="material-symbols-outlined">{{ t.icon || 'exercise' }}</span>
            </div>
            <span>{{ t.name }}</span>
          </div>
        </div>
      </div>

      <!-- Duration -->
      <div class="form-group glass-card" style="margin-bottom: 24px; padding: 24px;">
        <label class="form-label" style="text-align: center;">Duration</label>
        <div class="duration-input-wrapper">
          <input type="number" formControlName="duration_min" class="duration-input" min="1" placeholder="45">
          <span class="duration-label">MIN</span>
        </div>
      </div>

      <!-- Date/Time -->
      <div class="form-group glass-card" style="margin-bottom: 24px; display: flex; align-items: center; gap: 16px;">
        <span class="material-symbols-outlined text-muted">calendar_today</span>
        <div style="flex:1;">
          <label class="form-label" style="margin-bottom: 0;">Date & Time</label>
          <input type="datetime-local" class="form-control" formControlName="started_at" style="border:none; padding-bottom: 0;">
        </div>
      </div>

      <!-- Intensity -->
      <div class="form-group glass-card" style="margin-bottom: 24px;">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <label class="form-label" style="margin:0;">Intensity</label>
          <span class="intensity-value">{{ sessionForm.value.intensity }}<span class="text-muted">/10</span></span>
        </div>
        <input type="range" formControlName="intensity" min="1" max="10">
        <div class="intensity-labels">
          <span>Chill</span>
          <span>Moderate</span>
          <span>Peak</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="form-group glass-card" style="margin-bottom: 32px;">
        <label class="form-label" style="display: flex; gap: 8px; align-items: center;">
          <span class="material-symbols-outlined text-muted" style="font-size: 16px;">notes</span> Notes
        </label>
        <textarea class="form-control" formControlName="notes" rows="2" placeholder="How did it feel?" style="border:none; resize:none;"></textarea>
      </div>

      <button type="submit" class="btn-primary w-100 save-btn" [disabled]="sessionForm.invalid || saving">
        {{ saving ? 'SAVING...' : 'SAVE ACTIVITY' }}
      </button>

    </form>
  `,
  styles: [`
    .w-100 { width: 100%; }
    .sport-selector {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 8px;
      scrollbar-width: none;
    }
    .sport-selector::-webkit-scrollbar { display: none; }
    .sport-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      min-width: 72px;
      opacity: 0.5;
      transition: all 0.3s ease;
    }
    .sport-item.active {
      opacity: 1;
    }
    .sport-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--bg-surface-elevated);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);
      transition: all 0.3s;
    }
    .sport-item.active .sport-icon {
      background: var(--accent);
      color: var(--accent-on);
      border-color: var(--accent);
      box-shadow: var(--shadow-neon);
      transform: scale(1.1);
    }
    .sport-item span {
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    
    .duration-input-wrapper {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 8px;
    }
    .duration-input {
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-family: 'Lexend', sans-serif;
      font-size: 4rem;
      font-weight: 900;
      width: 120px;
      text-align: right;
      outline: none;
    }
    .duration-input::placeholder { color: var(--text-muted); opacity: 0.3; }
    .duration-label {
      font-family: 'Lexend', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-secondary);
    }
    
    .intensity-value {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--accent);
    }
    .intensity-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    
    .save-btn {
      position: relative;
      overflow: hidden;
    }
    .save-btn::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shine 3s infinite;
    }
    @keyframes shine {
      0% { left: -100%; }
      20% { left: 200%; }
      100% { left: 200%; }
    }
  `]
})
export class AddSessionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sessionsService = inject(SessionsService);
  private typesService = inject(TypesService);
  private router = inject(Router);

  activeTypes: TrainingType[] = [];
  saving = false;

  // Set default datetime to now
  protected defaultDate = new Date();

  sessionForm = this.fb.group({
    type_id: ['', Validators.required],
    // Extract local datetime string format for input YYYY-MM-DDTHH:mm
    started_at: [new Date(this.defaultDate.getTime() - this.defaultDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16), Validators.required],
    duration_min: [45, [Validators.required, Validators.min(1)]],
    intensity: [5],
    notes: ['']
  });

  async ngOnInit() {
    // Load only active types for the dropdown
    try {
      this.activeTypes = await this.typesService.getTypes(false);
      // Auto-select the first type to prevent invalid hidden form state
      if (this.activeTypes.length > 0 && !this.sessionForm.value.type_id) {
        this.sessionForm.patchValue({ type_id: this.activeTypes[0].id });
      }
    } catch(err) {
      console.error('Error loading types', err);
    }
  }

  async submit() {
    if (this.sessionForm.invalid) return;
    
    this.saving = true;
    try {
       const formVal = this.sessionForm.value;
       
       await this.sessionsService.createSession({
          type_id: formVal.type_id!,
          started_at: new Date(formVal.started_at!).toISOString(),
          duration_min: Number(formVal.duration_min!),
          intensity: Number(formVal.intensity!),
          notes: formVal.notes || undefined
       });
       
       // Success -> back to dashboard
       this.router.navigate(['/dashboard']);
    } catch(err) {
       console.error(err);
       alert('Error saving session. Check console.');
    } finally {
       this.saving = false;
    }
  }
}
