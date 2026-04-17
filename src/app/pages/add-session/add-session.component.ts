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
    <div class="header-row">
      <h1 class="page-title" style="margin-bottom: 0;">Add Session</h1>
      <button class="icon-btn" routerLink="/dashboard"><span class="material-icons">close</span></button>
    </div>

    <div class="glass-card" style="padding: 24px 16px; margin-bottom: 24px;">
      <form [formGroup]="sessionForm" (ngSubmit)="submit()">
        
        <div class="form-group">
          <label class="form-label">Activity Type *</label>
          <select class="form-control" formControlName="type_id">
             <option value="" disabled selected>Select an activity</option>
             <option *ngFor="let t of activeTypes" [value]="t.id">
                {{ t.name }}
             </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Date and Time *</label>
          <input type="datetime-local" class="form-control" formControlName="started_at">
        </div>

        <div class="form-group">
          <label class="form-label">Duration (minutes) *</label>
          <input type="number" class="form-control" formControlName="duration_min" min="1" placeholder="e.g. 45">
        </div>

        <div class="form-group">
          <label class="form-label">Intensity (1-10)</label>
          <div style="display:flex; align-items:center; gap:16px;">
             <input type="range" class="form-control" formControlName="intensity" min="1" max="10" style="flex:1; padding:0;">
             <span class="text-accent" style="font-weight:600; width:20px;">{{ sessionForm.value.intensity }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-control" formControlName="notes" rows="3" placeholder="How was it?"></textarea>
        </div>

        <button type="submit" class="btn-primary w-100" [disabled]="sessionForm.invalid || saving">
          {{ saving ? 'Saving...' : 'Save Activity' }}
        </button>

      </form>
    </div>
  `,
  styles: [`
    .icon-btn { background: transparent; border: none; color: var(--text-primary); cursor: pointer; }
    .w-100 { width: 100%; margin-top: 24px; }
    select.form-control { appearance: none; }
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
    duration_min: ['', [Validators.required, Validators.min(1)]],
    intensity: [5],
    notes: ['']
  });

  async ngOnInit() {
    // Load only active types for the dropdown
    try {
      this.activeTypes = await this.typesService.getTypes(false);
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
