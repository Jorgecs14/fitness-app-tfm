export interface MonthlyTracking {
  id: number;
  user_id: number;
  month_date: string;
  progress_photos_completed: boolean;
  notes?: string;
  created_at: string;
}

export interface CreateMonthlyTrackingData {
  user_id: number;
  month_date: string;
  progress_photos_completed?: boolean;
  notes?: string;
}

export interface UpdateMonthlyTrackingData {
  progress_photos_completed?: boolean;
  notes?: string;
}
