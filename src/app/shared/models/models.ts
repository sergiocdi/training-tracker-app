export interface UserSettings {
  id?: string;
  user_id?: string;
  weekly_sessions_goal: number;
  weekly_minutes_goal: number;
  score_weight_frequency: number;
  score_weight_duration: number;
  updated_at?: string;
}

export interface TrainingType {
  id: string;
  name: string;
  icon?: string;
  is_active: boolean;
  user_id: string | null;
  created_at: string;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  type_id: string;
  started_at: string;
  duration_min: number;
  intensity?: number;
  notes?: string;
  metrics?: any;
  created_at: string;
  
  // Custom joined property (front-end only)
  type?: TrainingType; 
}
