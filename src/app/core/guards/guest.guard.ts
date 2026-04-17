import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../supabase';

export const guestGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const { data: { session } } = await supabase.client.auth.getSession();

  if (session) {
    // Already logged in, redirect to dashboard
    return router.parseUrl('/dashboard');
  }

  return true;
};
