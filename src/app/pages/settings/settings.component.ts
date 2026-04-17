import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h1 class="page-title">Settings</h1>

    <div class="glass-card" style="margin-bottom: 24px;">
      <h3 style="margin-bottom: 20px;">Weekly Goals</h3>
      
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
        <div class="form-group">
           <label class="form-label">Sessions per week</label>
           <input type="number" class="form-control" formControlName="weekly_sessions_goal" min="1">
        </div>
        
        <div class="form-group">
           <label class="form-label">Minutes per week</label>
           <input type="number" class="form-control" formControlName="weekly_minutes_goal" min="1">
        </div>

        <!-- Hidden inputs for weights (we keep them as default for now or expose later) -->
        
        <button type="submit" class="btn-primary w-100" [disabled]="settingsForm.invalid || saving">
           {{ saving ? 'Saving...' : 'Save Goals' }}
        </button>
      </form>
    </div>

    <!-- Links to other settings -->
    <div class="glass-card menu-card" routerLink="/types" style="cursor: pointer;">
       <div>
         <h4 style="margin:0;">Manage Activity Types</h4>
         <p class="text-muted" style="margin: 4px 0 0; font-size: 13px;">Add or disable custom training types</p>
       </div>
       <span class="material-icons text-muted">chevron_right</span>
    </div>

    <div class="glass-card menu-card" style="margin-top: 16px; cursor: pointer;" (click)="exportData()">
       <div>
         <h4 style="margin:0;">Export Data (JSON)</h4>
         <p class="text-muted" style="margin: 4px 0 0; font-size: 13px;">Download your training history</p>
       </div>
       <span class="material-icons text-muted">download</span>
    </div>
  `,
  styles: [`
    .w-100 { width: 100%; margin-top: 16px; }
    .menu-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      transition: background 0.2s;
    }
    .menu-card:hover {
      background: var(--bg-surface-elevated);
    }
  `]
})
export class SettingsComponent implements OnInit {
  settingsService = inject(SettingsService);
  fb = inject(FormBuilder);

  settingsForm = this.fb.group({
    weekly_sessions_goal: [5, [Validators.required, Validators.min(1)]],
    weekly_minutes_goal: [250, [Validators.required, Validators.min(1)]],
    score_weight_frequency: [0.6],
    score_weight_duration: [0.4]
  });

  saving = false;

  async ngOnInit() {
    const s = await this.settingsService.getSettings();
    this.settingsForm.patchValue({
      weekly_sessions_goal: s.weekly_sessions_goal,
      weekly_minutes_goal: s.weekly_minutes_goal,
      score_weight_frequency: s.score_weight_frequency,
      score_weight_duration: s.score_weight_duration
    });
  }

  async saveSettings() {
    if (this.settingsForm.invalid) return;
    this.saving = true;
    try {
      await this.settingsService.updateSettings(this.settingsForm.value as any);
      alert('Settings saved!');
    } catch(err) {
      console.error(err);
      alert('Error saving settings.');
    } finally {
      this.saving = false;
    }
  }

  exportData() {
     // TODO: Implement actual data fetching via SessionsService to download JSON
     alert('Exporting feature will be available shortly!');
  }
}
