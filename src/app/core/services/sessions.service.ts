import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { TrainingSession } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  constructor(private supabase: SupabaseService) {}

  async getSessions(startDate?: string, endDate?: string) {
    let query = this.supabase.client
      .from('training_sessions')
      .select('*, type:training_types(*)')
      .order('started_at', { ascending: false });

    if (startDate) query = query.gte('started_at', startDate);
    if (endDate) query = query.lte('started_at', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data as TrainingSession[];
  }

  async createSession(session: Partial<TrainingSession>) {
    const userId = (await this.supabase.client.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("No user logged in");

    const payload = { ...session, user_id: userId };
    const { data, error } = await this.supabase.client
      .from('training_sessions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSession(id: string, updates: Partial<TrainingSession>) {
    const { data, error } = await this.supabase.client
      .from('training_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSession(id: string) {
    const { error } = await this.supabase.client
      .from('training_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
