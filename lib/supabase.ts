import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  clerk_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_onboarded: boolean;
  onboarding_completed_at: string | null;
  last_login_at: string;
}

export interface OnboardingData {
  id: string;
  user_id: string;
  passion: string;
  comfort_level: string;
  time_available: string;
  main_goal: string;
  target_audience: string | null;
  passion_embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  selected_niche: any;
  voice_style: string | null;
  content_format: string | null;
  timezone: string | null;
  notification_preferences: any;
  created_at: string;
  updated_at: string;
}

export interface ContentHistory {
  id: string;
  user_id: string;
  tool_used: string;
  content_type: string;
  content_data: any;
  created_at: string;
} 