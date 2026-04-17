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
    <div class="header-row">
      <h1 class="page-title" style="margin-bottom: 0;">Activity Types</h1>
      <button class="icon-btn" routerLink="/settings"><span class="material-icons">arrow_back</span></button>
    </div>

    <!-- Create New Type -->
    <div class="glass-card" style="margin-bottom: 24px; padding: 16px;">
       <form [formGroup]="typeForm" (ngSubmit)="createType()" style="display:flex; gap: 12px; align-items: flex-end;">
          <div class="form-group" style="flex:1; margin:0;">
             <label class="form-label">New Custom Type</label>
             <input type="text" class="form-control" formControlName="name" placeholder="e.g. Kickboxing">
          </div>
          <button type="submit" class="btn-primary" style="padding: 14px 20px;" [disabled]="typeForm.invalid">Add</button>
       </form>
    </div>

    <!-- Global Types -->
    <h3 class="text-secondary" style="margin-bottom: 12px; font-size: 16px;">Default Types (Global)</h3>
    <div class="types-list" style="margin-bottom: 32px;">
       <div *ngFor="let t of globalTypes" class="glass-card type-card">
          <span class="material-icons text-muted">{{ t.icon || 'fitness_center' }}</span>
          <span style="flex:1;">{{ t.name }}</span>
          <span class="badge">Global</span>
       </div>
    </div>

    <!-- Custom Types -->
    <h3 class="text-secondary" style="margin-bottom: 12px; font-size: 16px;">Your Custom Types</h3>
    <div *ngIf="customTypes.length === 0" class="text-muted" style="margin-bottom: 24px;">
       You don't have any custom types yet.
    </div>
    
    <div class="types-list">
       <div *ngFor="let t of customTypes" class="glass-card type-card" [class.inactive]="!t.is_active">
          <span class="material-icons" [ngClass]="t.is_active ? 'text-accent' : 'text-muted'">{{ t.icon || 'fitness_center' }}</span>
          <span style="flex:1; transition: opacity 0.3s;" [style.opacity]="t.is_active ? '1' : '0.5'">{{ t.name }}</span>
          
          <button class="toggle-btn" [class.active]="t.is_active" (click)="toggleType(t)">
             {{ t.is_active ? 'Active' : 'Inactive' }}
          </button>
       </div>
    </div>
  `,
  styles: [`
    .icon-btn { background: transparent; border: none; color: var(--text-primary); cursor: pointer; }
    .types-list { display: flex; flex-direction: column; gap: 12px; }
    .type-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .badge {
      background: var(--bg-surface-elevated);
      font-size: 11px;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .toggle-btn {
      background: var(--bg-surface-elevated);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn.active {
      background: var(--accent-faded);
      color: var(--accent);
      border-color: var(--accent);
    }
    .type-card.inactive {
      border-style: dashed;
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
