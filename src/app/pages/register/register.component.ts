import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="page-title">Create<br><span class="text-accent">Account</span></h1>
        <p class="text-secondary">Start tracking your weekly goals.</p>
      </div>

      <div class="glass-card auth-card">
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="you@example.com">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="At least 6 characters">
          </div>

          <div *ngIf="errorMsg" class="error-msg">
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn-primary w-100" [disabled]="registerForm.invalid || loading">
            {{ loading ? 'Creating...' : 'Sign Up' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-muted">Already have an account? <a routerLink="/login" class="text-accent text-decoration-none">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; flex-direction: column; justify-content: center; min-height: 80vh; }
    .auth-header { margin-bottom: 32px; }
    .auth-card { padding: 32px 24px; }
    .w-100 { width: 100%; margin-top: 16px; }
    .error-msg {
      color: var(--danger); font-size: 14px; margin-bottom: 16px; 
      background: var(--danger-faded); padding: 10px; border-radius: var(--radius-sm);
    }
    .auth-footer { margin-top: 24px; text-align: center; font-size: 14px; }
    .text-decoration-none { text-decoration: none; font-weight: 500; transition: color 0.2s; }
    .text-decoration-none:hover { color: var(--text-primary); }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMsg = '';

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.registerForm.value;

    try {
      await this.auth.signUp(email!, password!);
    } catch (err: any) {
      this.errorMsg = err.message || 'Error creating account.';
    } finally {
      this.loading = false;
    }
  }
}
