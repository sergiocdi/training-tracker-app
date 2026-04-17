import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { UserSettings } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  // Default values per DRFT
  private readonly defaultSettings: UserSettings = {
    weekly_sessions_goal: 5,
    weekly_minutes_goal: 250,
    score_weight_frequency: 0.6,
    score_weight_duration: 0.4
  };

  constructor(private supabase: SupabaseService) {}

  async getSettings(): Promise<UserSettings> {
    const userId = (await this.supabase.client.auth.getUser()).data.user?.id;
    if (!userId) return this.defaultSettings;

    const { data, error } = await this.supabase.client
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      if (error?.code !== 'PGRST116') {
         console.warn('Could not fetch user settings, using defaults', error);
      }
      return this.defaultSettings;
    }
    
    return data as UserSettings;
  }

  async updateSettings(settings: Partial<UserSettings>) {
    const userId = (await this.supabase.client.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("No user logged in");

    const { data, error } = await this.supabase.client
      .from('user_settings')
      .upsert({ ...settings, user_id: userId, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
