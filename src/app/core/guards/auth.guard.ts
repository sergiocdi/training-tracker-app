import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../supabase';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const { data: { session } } = await supabase.client.auth.getSession();

  if (session) {
    return true;
  }

  // Not logged in, redirect to login
  return router.parseUrl('/login');
};
