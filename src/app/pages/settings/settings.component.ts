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
    <div class="header-row" style="margin-bottom: 24px;">
      <h1 class="page-title">SETTINGS<span class="text-accent">.</span></h1>
    </div>

    <div class="glass-card" style="margin-bottom: 32px;">
      <h3 class="font-lexend text-secondary" style="margin-bottom: 32px; font-size: 1rem; letter-spacing: 0.1em; text-transform: uppercase;">Weekly Goals</h3>
      
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
        <div class="form-group" style="position: relative;">
           <label class="form-label" style="display:flex; justify-content:space-between; align-items:baseline;">
              Sessions / Week <span class="text-accent font-lexend" style="font-size:1.5rem; font-weight: 900;">{{ settingsForm.value.weekly_sessions_goal }}</span>
           </label>
           <input type="range" class="" formControlName="weekly_sessions_goal" min="1" max="14" style="width:100%;">
        </div>
        
        <div class="form-group" style="position: relative; margin-top:32px;">
           <label class="form-label" style="display:flex; justify-content:space-between; align-items:baseline;">
              Minutes / Week <span class="text-accent font-lexend" style="font-size:1.5rem; font-weight: 900;">{{ settingsForm.value.weekly_minutes_goal }}</span>
           </label>
           <input type="range" class="" formControlName="weekly_minutes_goal" min="30" max="600" step="30" style="width:100%;">
        </div>

        <!-- Hidden inputs for weights -->
        
        <button type="submit" class="btn-primary w-100" [disabled]="settingsForm.invalid || saving" style="margin-top: 32px;">
           {{ saving ? 'SAVING...' : 'SAVE GOALS' }}
        </button>
      </form>
    </div>

    <!-- Links to other settings -->
    <div class="glass-card menu-card" routerLink="/types" style="cursor: pointer; margin-bottom:16px;">
       <div>
         <h4 class="font-lexend text-primary" style="margin:0; font-size:1.1rem;">Activity Types</h4>
         <p class="text-secondary" style="margin: 4px 0 0; font-size: 0.85rem;">Manage custom disciplines</p>
       </div>
       <div class="icon-wrap">
         <span class="material-symbols-outlined">arrow_forward</span>
       </div>
    </div>

    <div class="glass-card menu-card" style="cursor: pointer;" (click)="exportData()">
       <div>
         <h4 class="font-lexend text-primary" style="margin:0; font-size:1.1rem;">Export Data</h4>
         <p class="text-secondary" style="margin: 4px 0 0; font-size: 0.85rem;">Download history as JSON</p>
       </div>
       <div class="icon-wrap">
         <span class="material-symbols-outlined">download</span>
       </div>
    </div>
  `,
  styles: [`
    .w-100 { width: 100%; }
    .menu-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      transition: background 0.3s;
    }
    .menu-card:hover {
      background: var(--bg-surface-elevated);
    }
    .menu-card:hover .icon-wrap { background: var(--accent); color: var(--accent-on); border-color:var(--accent); }
    .icon-wrap {
      width: 40px; height: 40px; border-radius: 50%; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display:flex; align-items:center; justify-content:center; color: var(--text-primary); transition:0.3s;
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
