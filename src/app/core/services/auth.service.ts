import { Injectable, signal, computed } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  
  // Expose the signal as readonly or computed
  public readonly currentUser = computed(() => this.currentUserSignal());

  constructor(private supabase: SupabaseService, private router: Router) {
    this.supabase.client.auth.getSession().then(({ data: { session } }) => {
      this.currentUserSignal.set(session?.user ?? null);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.currentUserSignal.set(session?.user ?? null);
    });
  }

  get session() {
    return this.supabase.client.auth.getSession();
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.router.navigate(['/']);
    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signUp({ email, password });
    if (error) throw error;
    // Auto-login after sign-up (since email confirmation is OFF)
    this.router.navigate(['/']);
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) throw error;
    this.router.navigate(['/login']);
  }
}
