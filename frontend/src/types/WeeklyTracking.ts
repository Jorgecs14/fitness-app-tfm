export interface WeeklyTracking {
  id: number;
  user_id: number;
  week_start_date: string;
  weight?: number;
  weight_photo_url?: string;
  chest_measurement?: number;
  waist_measurement?: number;
  hip_measurement?: number;
  thigh_measurement?: number;
  bicep_measurement?: number;
  diet_difficulties?: string;
  exercise_difficulties?: string;
  bowel_movements_per_week?: number;
  daily_water_intake?: number;
  sleep_quality?: 'good' | 'bad' | 'regular';
  training_days_completed?: number;
  diet_deviations?: string;
  self_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWeeklyTrackingData {
  user_id: number;
  week_start_date: string;
  weight?: number;
  weight_photo_url?: string;
  chest_measurement?: number;
  waist_measurement?: number;
  hip_measurement?: number;
  thigh_measurement?: number;
  bicep_measurement?: number;
  diet_difficulties?: string;
  exercise_difficulties?: string;
  bowel_movements_per_week?: number;
  daily_water_intake?: number;
  sleep_quality?: 'good' | 'bad' | 'regular';
  training_days_completed?: number;
  diet_deviations?: string;
  self_rating?: number;
}

export interface UpdateWeeklyTrackingData {
  weight?: number;
  weight_photo_url?: string;
  chest_measurement?: number;
  waist_measurement?: number;
  hip_measurement?: number;
  thigh_measurement?: number;
  bicep_measurement?: number;
  diet_difficulties?: string;
  exercise_difficulties?: string;
  bowel_movements_per_week?: number;
  daily_water_intake?: number;
  sleep_quality?: 'good' | 'bad' | 'regular';
  training_days_completed?: number;
  diet_deviations?: string;
  self_rating?: number;
}

export type SleepQuality = {
  key: 'good' | 'bad' | 'regular';
  label: string;
};

export const SLEEP_QUALITY_OPTIONS: SleepQuality[] = [
  { key: 'good', label: 'Bueno' },
  { key: 'bad', label: 'Malo' },
  { key: 'regular', label: 'Regular' }
];
