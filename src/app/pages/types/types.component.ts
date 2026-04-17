import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TypesService } from '../../core/services/types.service';
import { TrainingType } from '../../shared/models/models';

@Component({
  selector: 'app-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="header-row" style="margin-bottom: 24px;">
      <h1 class="page-title">TYPES<span class="text-accent">.</span></h1>
      <button class="btn-icon" routerLink="/settings" style="border:none; background:transparent;">
         <span class="material-symbols-outlined">arrow_back</span>
      </button>
    </div>

    <!-- Create New Type -->
    <div class="glass-card" style="margin-bottom: 32px; padding: 24px;">
       <form [formGroup]="typeForm" (ngSubmit)="createType()" style="display:flex; flex-direction:column; gap: 16px;">
          <div class="form-group" style="margin:0;">
             <label class="form-label">New Custom Activity</label>
             <input type="text" class="form-control" formControlName="name" placeholder="E.g. Martial Arts">
          </div>
          <button type="submit" class="btn-primary" [disabled]="typeForm.invalid">CREATE</button>
       </form>
    </div>

    <h3 class="font-lexend text-secondary" style="margin-bottom: 16px; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase;">Default Types</h3>
    <div class="types-list" style="margin-bottom: 32px;">
       <div *ngFor="let t of globalTypes" class="glass-card type-card">
          <div class="icon-wrap">
             <span class="material-symbols-outlined text-muted">{{ t.icon || 'exercise' }}</span>
          </div>
          <span class="font-lexend text-primary" style="flex:1; font-size:1.1rem;">{{ t.name }}</span>
          <span class="badge">Built-in</span>
       </div>
    </div>

    <h3 class="font-lexend text-secondary" style="margin-bottom: 16px; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase;">Custom Types</h3>
    <div *ngIf="customTypes.length === 0" class="text-muted" style="margin-bottom: 24px; font-size:0.9rem;">
       No custom types created yet.
    </div>
    
    <div class="types-list">
       <div *ngFor="let t of customTypes" class="glass-card type-card" [class.inactive]="!t.is_active">
          <div class="icon-wrap" [ngClass]="t.is_active ? 'active-icon' : ''">
             <span class="material-symbols-outlined" [ngClass]="t.is_active ? 'text-accent' : 'text-muted'">{{ t.icon || 'exercise' }}</span>
          </div>
          <span class="font-lexend" style="flex:1; font-size:1.1rem; transition: opacity 0.3s;" [style.color]="t.is_active ? 'var(--text-primary)' : 'var(--text-muted)'">{{ t.name }}</span>
          
          <button class="toggle-btn" [class.active]="t.is_active" (click)="toggleType(t)">
             {{ t.is_active ? 'ON' : 'OFF' }}
          </button>
       </div>
    </div>
  `,
  styles: [`
    .btn-icon { color: var(--text-primary); cursor: pointer; display:flex; align-items:center; justify-content:center; }
    .types-list { display: flex; flex-direction: column; gap: 12px; }
    .type-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
    }
    .icon-wrap { width:48px; height:48px; border-radius:50%; background:var(--bg-surface-elevated); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; }
    .icon-wrap.active-icon { background: var(--accent-faded); border-color: var(--accent); }
    .badge {
      background: var(--bg-surface-elevated);
      font-size: 0.7rem; font-weight: 700;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: 'Lexend', sans-serif;
    }
    .toggle-btn {
      background: var(--bg-surface-elevated);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 6px 16px;
      font-size: 0.8rem;
      font-weight: 900;
      font-family: 'Lexend', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn.active {
      background: var(--accent);
      color: var(--accent-on);
      border-color: var(--accent);
      box-shadow: var(--shadow-neon);
    }
    .type-card.inactive {
      opacity: 0.6;
    }
  `]
})
export class TypesComponent implements OnInit {
  typesService = inject(TypesService);
  fb = inject(FormBuilder);

  globalTypes: TrainingType[] = [];
  customTypes: TrainingType[] = [];

  typeForm = this.fb.group({
    name: ['', Validators.required]
  });

  async ngOnInit() {
    await this.loadTypes();
  }

  async loadTypes() {
    // include inactive so we can toggle them back
    const all = await this.typesService.getTypes(true); 
    this.globalTypes = all.filter(t => t.user_id === null);
    this.customTypes = all.filter(t => t.user_id !== null);
  }

  async createType() {
    if (this.typeForm.invalid) return;
    try {
      await this.typesService.createType(this.typeForm.value.name!);
      this.typeForm.reset();
      await this.loadTypes();
    } catch(err) {
      console.error(err);
      alert('Error creating type');
    }
  }

  async toggleType(type: TrainingType) {
    try {
      await this.typesService.updateType(type.id, { is_active: !type.is_active });
      await this.loadTypes();
    } catch(err) {
      console.error(err);
    }
  }
}
