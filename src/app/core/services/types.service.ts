import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { TrainingType } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class TypesService {
  constructor(private supabase: SupabaseService) {}

  async getTypes(includeInactive = false) {
    let query = this.supabase.client
      .from('training_types')
      .select('*')
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as TrainingType[];
  }

  async createType(name: string, icon: string = 'fitness_center') {
    const userId = (await this.supabase.client.auth.getUser()).data.user?.id;
    const { data, error } = await this.supabase.client
      .from('training_types')
      .insert([{ name, icon, user_id: userId, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateType(id: string, updates: Partial<TrainingType>) {
    const { data, error } = await this.supabase.client
      .from('training_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Logical delete: sets is_active = false
  async deactivateType(id: string) {
    return this.updateType(id, { is_active: false });
  }
}
