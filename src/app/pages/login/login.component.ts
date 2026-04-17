import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="page-title text-center" style="font-size: 3.5rem;">
          WELCOME<br>
          <span class="text-accent">BACK</span>
        </h1>
        <p class="text-secondary text-center" style="letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.8rem; margin-top: 16px;">
          Sign in to track your performance
        </p>
      </div>

      <div class="glass-card auth-card">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="athlete@velocity.app">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="••••••••">
          </div>

          <div *ngIf="errorMsg" class="error-msg">
            <span class="material-symbols-outlined">error</span>
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn-primary w-100" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Authenticating...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-muted">Don't have an account? <a routerLink="/register" class="text-accent text-decoration-none">Join Velocity</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; flex-direction: column; justify-content: center; min-height: 80vh; }
    .text-center { text-align: center; }
    .auth-header { margin-bottom: 40px; }
    .auth-card { padding: 40px 24px; border-radius: var(--radius-xl); }
    .w-100 { width: 100%; margin-top: 32px; }
    .error-msg {
      color: var(--danger); font-size: 14px; margin-bottom: 24px; 
      background: var(--danger-faded); padding: 12px; border-radius: var(--radius-sm);
      display: flex; align-items: center; gap: 8px; font-weight: 500;
    }
    .auth-footer { margin-top: 32px; text-align: center; font-size: 0.9rem; }
    .text-decoration-none { text-decoration: none; font-weight: 700; transition: color 0.2s; letter-spacing: 0.05em; }
    .text-decoration-none:hover { color: var(--text-primary); text-shadow: var(--shadow-neon); }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMsg = '';

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.loginForm.value;

    try {
      await this.auth.signIn(email!, password!);
    } catch (err: any) {
      this.errorMsg = err.message || 'Invalid credentials.';
    } finally {
      this.loading = false;
    }
  }
}
